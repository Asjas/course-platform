---
applyTo: "apps/web/src/**/*.test.tsx, apps/web/src/**/*.test.ts, apps/web/src/test-utils.tsx"
description: "React Testing Library unit test standards based on Kent C. Dodds' principles"
---

# React Testing Library Unit Test Standards

These rules apply to all component tests in `apps/web/src/`. They are based on
Kent C. Dodds' testing philosophy at https://kentcdodds.com/blog.

## The one rule that overrides everything else

**Never mock npm packages.**

Mocking a third-party package replaces the real implementation with a fake one
that can silently drift from the real API. You get green tests while production
is broken. Always run the real package.

### What you CAN mock (network / database boundaries)

| Module | Reason |
|---|---|
| `~/lib/auth.client` | Real HTTP calls to the auth server |
| `~/lib/trpc.client` | Real HTTP calls to the tRPC API; mock trpc and include a real `mutationFn` / `queryFn` so React Query still exercises its own code paths |
| `~/lib/db.collections` | Real database / sync operations |
| `sonner` | Side-effect notification sink |
| `~/components/blocker` | Router-blocking behaviour has its own test; blocking would swallow form submissions |
| `~/components/markdown-editor` | Heavy third-party rich-text editor with its own tests |

### What you MUST NOT mock

- `@tanstack/react-router` — use `renderWithProviders` from `~/test-utils`
- `@tanstack/react-query` — use `renderWithQueryClient` or `renderWithProviders`
- `@headlessui/react` — works correctly in JSDOM
- `lucide-react` — SVG icons render fine in JSDOM
- `@packages/shared-ui/*` — Radix UI primitives work in JSDOM
- Any other npm UI / utility package

**Legitimate exception:** `react-youtube` is mocked because the YouTube IFrame
API is a browser-only runtime that cannot run in JSDOM. Mock it as a realistic
`<iframe src="https://www.youtube.com/embed/{videoId}">` element.

---

## Shared test utilities (`apps/web/src/test-utils.tsx`)

### `renderWithProviders` — router + query client (async!)

`RouterProvider` resolves its route tree **asynchronously**. The helper calls
`await router.load()` internally, so callers **must** `await` it and the `it()`
callback **must** be `async`.

```tsx
it("renders the sign-in form", async () => {
  await renderWithProviders(<SignInForm />);
  expect(screen.getByLabelText("Email")).toBeInTheDocument();
});

it("navigates to /dashboard on success", async () => {
  const { router } = await renderWithProviders(<SignInForm />, {
    initialPath: "/signin",
  });
  await user.click(screen.getByRole("button", { name: "Sign In" }));
  await waitFor(() =>
    expect(router.state.location.pathname).toBe("/dashboard"),
  );
});
```

### `renderWithQueryClient` — query client only (synchronous)

Use this for components that need React Query but no router context:

```tsx
it("fetches and renders users", async () => {
  renderWithQueryClient(<MentionPicker {...props} />);
  expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
});
```

---

## Navigation assertions

Use `router.state.location.pathname` — never assert on a mocked `useNavigate`:

```tsx
// ✅ Proves the router actually changed location
await waitFor(() =>
  expect(router.state.location.pathname).toBe("/dashboard"),
);

// ❌ Only proves navigate() was called — the route might not have changed
expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
```

**Note:** TanStack Router URL-encodes `:` as `%3A`. When IDs contain colons,
use a partial match:

```tsx
expect(router.state.location.pathname).toMatch(/^\/support\/suptick/);
```

---

## `vi.hoisted` for data referenced in `vi.mock` factories

`vi.mock(...)` is hoisted above all `const`/`let` declarations. Any value
referenced inside the factory must be created with `vi.hoisted`:

```tsx
// ✅ Correct
const { mockUsers } = vi.hoisted(() => ({
  mockUsers: [{ id: "1", name: "Alice" }],
}));
vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    mentions: {
      getChannelMentions: {
        queryOptions: vi.fn().mockReturnValue({
          queryKey: ["mentions"],
          queryFn: vi.fn().mockResolvedValue(mockUsers),
        }),
      },
    },
  },
}));

// ❌ Broken — mockUsers is undefined when the factory runs
const mockUsers = [{ id: "1", name: "Alice" }];
vi.mock("~/lib/trpc.client", () => ({
  trpc: { /* ... mockUsers is undefined here ... */ },
}));
```

---

## `trpcClient` mock shape when using `renderWithQueryClient`

When mocking `~/lib/trpc.client` for components that use `useMutation` or
`useQuery` internally, include real `mutationFn` / `queryFn` functions so that
React Query actually exercises its own code paths:

```tsx
vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    images: {
      getPresignedUrl: {
        // Include mutationFn so useMutation has something to call
        mutationOptions: vi.fn(() => ({
          mutationFn: vi.fn().mockResolvedValue({ presignedUrl: "", publicUrl: "" }),
        })),
      },
    },
  },
}));
```

---

## Query selectors — priority order

| Priority | Method | Use when |
|---|---|---|
| 1 | `getByRole` | Buttons, links, headings, form inputs with labels |
| 2 | `getByLabelText` | Form inputs associated with a `<label>` |
| 3 | `getByPlaceholderText` | Input placeholder as a last resort |
| 4 | `getByText` | Visible static text |
| 5 | `getByDisplayValue` | Current value of a select / input |
| 6 | `getByTestId` | **Avoid.** Only when no semantic alternative exists |

**Never** use `getByTestId` to find icons, SVGs, or decorative elements — that
asserts implementation details, not user-visible behaviour.

---

## `userEvent` over `fireEvent`

`userEvent.setup()` simulates real browser event sequences (focus, keydown,
input, keyup, blur). `fireEvent` fires a single synthetic event and misses the
intermediate steps that real components depend on.

```tsx
// ✅ Real interaction
const user = userEvent.setup();
await user.type(screen.getByLabelText("Email"), "test@example.com");
await user.click(screen.getByRole("button", { name: "Submit" }));

// ❌ Misses keydown/keyup, focus events
fireEvent.change(input, { target: { value: "test@example.com" } });
```

---

## Clipboard mocking

`userEvent.setup()` makes `navigator.clipboard` a getter-only property.
Use `vi.spyOn` — not `Object.assign`:

```tsx
// ✅
vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();

// ❌ Throws in environments where userEvent has already run setup
Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
```

---

## Radix UI / HeadlessUI portals

Radix Popover, Dialog, and similar components render content into a portal at
`document.body`. RTL's `screen.*` queries search the whole document, so portal
content **is** found — no extra configuration needed.

Radix Tabs renders only the **active** tab's content. To assert on a non-default
tab, click the tab first:

```tsx
await user.click(triggerButton);
await user.click(await screen.findByRole("tab", { name: /offline/i }));
expect(screen.getByText("OfflineCollection")).toBeInTheDocument();
```

---

## Avoiding `act(...)` warnings

React prints `An update to X inside a test was not wrapped in act(...)` when a
component state update happens **after** a test's last `await` — or inside a
synchronous test — and RTL has no chance to flush it automatically.

### Root causes and fixes

#### 1. Component has a `useEffect` with async state (`setHtml`, `setData`, …)

If the component calls an async function inside `useEffect` and then calls
`setState`, a synchronous `render()` + `getBy*` assertion will finish before
the Promise resolves, leaving the state update unhandled.

```tsx
// ❌ setHtml fires after the test exits — triggers act warning
it("renders the username", () => {
  render(<ChatMessage msg={msg} />);
  expect(screen.getByRole("button", { name: "alice" })).toBeInTheDocument();
});

// ✅ findBy* waits for the async state to settle
it("renders the username", async () => {
  render(<ChatMessage msg={msg} />);
  expect(
    await screen.findByRole("button", { name: "alice" }),
  ).toBeInTheDocument();
});
```

For **negative assertions** where `findBy*` would throw, first await any
stable element to flush the microtask queue, then assert absence:

```tsx
// ✅ await a present element first, then assert absence
it("does not show reply button when replyCount is 0", async () => {
  render(<ChatMessage msg={makeMessage({ replyCount: 0 })} />);
  await screen.findByRole("button", { name: "alice" }); // flush async render
  expect(screen.queryByRole("button", { name: /repl/i })).not.toBeInTheDocument();
});
```

#### 2. `@headlessui/react` or `react-aria-components` dialogs / modals

Both libraries initialise internal focus/accessibility state asynchronously
when a Dialog opens. Tests that call synchronous `render()` + `getByRole()`
will see act warnings.

```tsx
// ❌ HeadlessUI Dialog fires async focus management — triggers act warning
it("shows the dialog title", () => {
  render(<MyDialog isOpen={true} />);
  expect(screen.getByRole("heading", { name: "Confirm" })).toBeInTheDocument();
});

// ✅ findBy* waits for the Dialog to finish initialising
it("shows the dialog title", async () => {
  render(<MyDialog isOpen={true} />);
  expect(
    await screen.findByRole("heading", { name: "Confirm" }),
  ).toBeInTheDocument();
});
```

The same applies to `renderWithQueryClient` — it is synchronous, so use
`findBy*` when the rendered component includes a dialog/modal:

```tsx
// ✅
renderWithQueryClient(<ReportDialog isOpen={true} />);
expect(await screen.findByRole("dialog")).toBeInTheDocument();
```

#### 3. `react-aria-components` `Button` keyboard interactions

Pressing Enter or Space on a `react-aria-components` `<Button>` fires internal
press-state updates after the key event resolves. Wrap the resulting assertion
in `waitFor` to absorb those updates:

```tsx
// ❌ Button's internal state still updating after user.keyboard resolves
it("closes on Enter", async () => {
  const user = userEvent.setup();
  render(<ConfirmDialog {...props} />);
  screen.getByRole("button", { name: "Cancel" }).focus();
  await user.keyboard("{Enter}");
  expect(props.onOpenChange).toHaveBeenCalledWith(false); // may warn
});

// ✅ waitFor absorbs the remaining Button state updates
it("closes on Enter", async () => {
  const user = userEvent.setup();
  render(<ConfirmDialog {...props} />);
  screen.getByRole("button", { name: "Cancel" }).focus();
  await user.keyboard("{Enter}");
  await waitFor(() => {
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

#### 4. Resolving a pending promise at the end of a test

When a test holds a pending promise to keep a component in an in-progress
state, resolving it bare triggers the component's `finally`/`catch` state
updates outside `act`. After calling the resolver, `await waitFor` on the
expected post-resolution state:

```tsx
// ❌ setSendingIds runs outside act after resolveUpdate()
it("disables button while sending", async () => {
  // … set up pendingUpdate / resolveUpdate …
  await user.click(screen.getByRole("button", { name: /send invite/i }));
  expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
  resolveUpdate(); // state update from finally block fires unguarded
});

// ✅ wait for the post-resolution state to confirm the update settled
it("disables button while sending", async () => {
  // … set up pendingUpdate / resolveUpdate …
  await user.click(screen.getByRole("button", { name: /send invite/i }));
  expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
  resolveUpdate();
  await waitFor(() => {
    expect(
      screen.queryByRole("button", { name: /sending/i }),
    ).not.toBeInTheDocument();
  });
});
```

#### 5. `renderHook` with `useEffect`-driven state

`renderHook` is synchronous. If the hook reads initial state inside a
`useEffect`, the state update fires asynchronously. Wrap the assertion in
`waitFor`:

```tsx
// ❌ state from useEffect not yet applied
test("initializes lastSyncedAt", () => {
  const { result } = renderHook(() => useSupportTicketsSync());
  expect(result.current.lastSyncedAt).toBe(timestamp); // may warn or fail
});

// ✅
test("initializes lastSyncedAt", async () => {
  const { result } = renderHook(() => useSupportTicketsSync());
  await waitFor(() => {
    expect(result.current.lastSyncedAt).toBe(timestamp);
  });
});
```

---

## Common mistakes checklist

Before committing a new test file, verify:

- [ ] No `vi.mock` for npm packages (`@tanstack/*`, `lucide-react`, `@headlessui/*`, Radix UI)
- [ ] All `renderWithProviders` calls are `await`ed and `it()` is `async`
- [ ] Navigation assertions use `router.state.location.pathname`
- [ ] Data referenced in `vi.mock` factories is created with `vi.hoisted`
- [ ] `trpcClient` mock includes `mutationFn`/`queryFn` where React Query is used
- [ ] Queries use `getByRole` / `getByLabelText` in preference to `getByTestId`
- [ ] Interactions use `userEvent.setup()` not `fireEvent`
- [ ] Clipboard mocking uses `vi.spyOn`, not `Object.assign`
- [ ] Components with async `useEffect` state use `findBy*` instead of `getBy*`
- [ ] Tests rendering `@headlessui/react` or `react-aria-components` dialogs use `findBy*`
- [ ] `react-aria-components` keyboard interactions wrap assertions in `waitFor`
- [ ] Resolved pending-promise state is awaited via `waitFor` before the test ends
- [ ] `renderHook` tests with `useEffect` state wrap assertions in `waitFor`
