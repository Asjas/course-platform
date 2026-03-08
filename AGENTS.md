# Course Platform - Agent Guidance

This file provides guidance to AI coding agents (Claude Code, Cursor AI, Codex,
Gemini CLI, GitHub Copilot, and other AI coding assistants) when working with
code in this repository.

## What this repository is

This is a **full-stack TypeScript monorepo** for a course platform built with
modern tooling:

- **apps/web**: React 19 + Vite 7 + TanStack (Router, Query, Form) + Tailwind
  CSS 4
- **apps/server**: Fastify 5 + tRPC + Drizzle ORM + Better Auth
- **packages/shared-ui**: Radix UI component library
- **marketing/learn-fastify**: Astro static site

**Runtime requirements**: PostgreSQL 18, Redis/Dragonfly, Node.js >=22.16.0,
pnpm 10

## High-level architecture

### 1) Frontend (`apps/web/`)

Single-page application with file-based routing and offline-first data layer.

```sh
apps/web/src/
├── routes/           # TanStack Router (file-based)
├── components/       # React components (PascalCase)
├── lib/              # Utilities, API clients, collections
├── hooks/            # Custom React hooks
├── schema/           # Zod validation schemas
└── styles/           # Tailwind CSS styles
```

Key patterns:

- **Offline-first**: ALL data fetching goes through TanStack React-DB
  collections (`~/lib/collections/`), never direct tRPC/React Query in
  components.
- **File-based routing**: TanStack Router with `__root.tsx`, `index.tsx`,
  `$param.tsx`, `(group)/`, `_layout/` conventions.
- **Functional components**: ES5 function declarations (`function MyComponent()`
  not arrows).
- **No `.js`/`.ts` extensions** in imports (Vite handles resolution).

### 2) Backend (`apps/server/`)

REST + tRPC API server with PostgreSQL database.

```sh
apps/server/src/
├── routes/           # Fastify REST routes
├── routers/          # tRPC routers
├── db/
│   ├── schema/       # Drizzle table definitions (flat files)
│   ├── queries/      # Read operations (prepared statements)
│   └── mutations/    # Write operations
├── lib/              # Auth, logging, redis, email
├── plugins/          # Fastify plugins
└── hooks/            # Fastify hooks
```

Key patterns:

- **Drizzle ORM**: Schemas in `db/schema/`, queries in `db/queries/`, mutations
  in `db/mutations/`.
- **Prepared statements**: MUST be module-scoped (top-level), never
  function-scoped.
- **`.js` extension** required for relative imports (ESM output).
- **Path alias**: `~/` maps to `src/`.

### 3) Shared UI (`packages/shared-ui/`)

Radix UI component library shared across apps.

### 4) Marketing (`marketing/learn-fastify/`)

Astro static site for the learn-fastify course marketing page.

## Common commands

Run from repository root. **Always use pnpm** (never npm or yarn).

```bash
# Setup
npm install -g pnpm@10.26.2        # Install pnpm (if not available)
pnpm install --frozen-lockfile      # Install dependencies

# Development
pnpm dev                            # All apps concurrently
pnpm --filter @apps/web dev         # Frontend only (port 4173)
pnpm --filter @apps/server dev      # Backend only (port 5000)

# Validation (REQUIRED before every commit)
pnpm format                         # Auto-fix formatting (Prettier with cache)
#   CRITICAL: Always use `pnpm format` which includes --cache flags.
#   Never use `prettier --write` directly without cache - it's much slower!
pnpm lint                           # ESLint (auto-fix when possible)
pnpm typecheck                      # TypeScript strict mode
pnpm build                          # Full Turborepo build

# Testing
pnpm test                           # All tests (Vitest)
pnpm --filter @apps/server test     # Server tests only
pnpm --filter @apps/web test        # Web tests only
pnpm --filter @apps/web e2e         # Cypress interactive
pnpm --filter @apps/web e2e:run     # Cypress headless

# Database (Drizzle)
(cd apps/server && DATABASE_URL=postgresql://localhost:5432/dummy pnpm dlx tsx node_modules/drizzle-kit/bin.cjs generate --config src/drizzle.config.ts)
pnpm --filter @apps/server drizzle:migrate
pnpm --filter @apps/server drizzle:studio
```

### E2E Workflow (Mandatory)

For Cypress E2E runs, follow this exact order:

1. Start backend API first: `pnpm --filter @apps/server dev`
2. Start frontend preview next: `pnpm --filter @apps/web preview`
3. Wait until both are ready (`http://localhost:5000` and `http://localhost:4173`)
4. Run only changed spec files: `pnpm --filter @apps/web e2e:run -- --spec "cypress/e2e/<changed-spec>.cy.ts"`

Known failure mode (2026-03-07): Running `pnpm preview` from repository root
fails (`ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "preview" not found`) and
causes wasted E2E cycles. Always use the filtered preview command above.

Critical guardrails:

- **ALWAYS scan implementation BEFORE writing tests**. Read the actual page component, sheet components, and form fields to understand exact button text, field names, form structure, and UI behavior. NEVER write tests based on assumptions or invented field names. This is mandatory - no exceptions.
- Do NOT run bare `pnpm preview` from repository root. Use `pnpm --filter @apps/web preview`.
- Do NOT run Cypress until both backend and frontend are confirmed reachable.
- When you start backend or frontend services for testing, stop them when finished. Prefer sending `Ctrl+C` and confirm the terminal exits; if that is not available or the process remains alive, kill the listeners on the ports in use so `5000` and `4173` can be reused.
- After creating or editing any E2E spec, run that spec immediately.
- Never run the full E2E suite when validating a targeted change unless explicitly requested.
- Prefer direct scoped execution from `apps/web`: `pnpm cypress run --spec "cypress/e2e/<changed-spec>.cy.ts"` to avoid accidental broader suite runs.
- E2E CRUD tests must clean up data through normal UI delete flows. Cleanup should double as delete-path coverage.
- E2E authorization tests must cover ownership boundaries: user A can access user A data, user B cannot access user A data.
- Exception: support tickets are completely public (no authentication required). In E2E, verify anyone can view ticket details but only owners and admins can edit/delete (owner/admin edit/delete buttons must only appear for ticket owners and admins).
- E2E authorization tests must cover role boundaries: admin can access admin routes/data, non-admin users cannot.
- For permission failures, assert both blocked behavior and a visible user-facing popup/toast with the backend access/permission error.
- Always inspect the failing test output and identify the exact failing condition before editing code.
- If a failing assertion may represent important or expected behavior, fix the underlying code rather than weakening the test.
- If it is ambiguous whether the failure should be fixed in the spec or the product code, stop and ask the user before making that change. This is mandatory for security-sensitive behavior so tests do not accidentally remove protections.

**CRITICAL: E2E Tests MUST Test Through the UI, NOT Bypass It**

E2E tests exercise the entire system end-to-end, including the REAL USER EXPERIENCE. **NEVER use `cy.request()` for authentication or data setup** — always drive flows through the real UI. This includes signup, signin, and any account setup steps.

- ❌ **WRONG**: `cy.request("POST", "/api/auth/sign-up/email", {...})` — bypasses the UI, hides auth bugs
- ❌ **WRONG**: `cy.intercept("**/trpc/*", req => req.reply({ response }))` — mocks the backend, hides real bugs
- ✅ **RIGHT**: Visit `/signup` → fill form → submit → verify redirect to `/dashboard`
- ✅ **RIGHT**: `cy.intercept()` is allowed to **observe/wait** on network calls (e.g., `cy.wait("@createTicket")`), but NOT to mock or stub responses

**For authorization boundary testing**:

1. **Route-level access control**:
   - Login as non-admin
   - Try to navigate to `/admin/*` page through UI
   - Expect page to FAIL TO LOAD or redirect back
   - Verify error message appears to user
2. **If route guard blocks page load, stop there in E2E**:
   - Do NOT try to force mutation-level tests through UI when page cannot load
   - E2E expectation is route-level denial (redirect/forbidden UI + user-facing message)
   - Add server-side Vitest coverage for protected tRPC endpoints to verify non-admin requests are rejected
   - Endpoint authorization checks belong in `apps/server` tests, not Cypress UI tests
3. **Admin user can perform actions**:
   - Login as admin
   - Same actions succeed

**Key Principle**: "As a user, you expect the page to not load or show an error message. NOT for the app to make direct HTTP requests to test permissions."

E2E authorization tests should verify:

- Route guards prevent non-admin access (or show error message)
- UI reflects denied access when non-admin users hit protected routes
- Error messages are displayed properly in the UI
- Admin users can perform their actions

E2E stabilization practices (applies to all features):

- Prefer stable positive assertions (state is present and correct) over brittle global negative assertions that may fail due to unrelated seeded data.
- Keep diagnostics temporary: add focused logs/assertions only while triaging, then remove instrumentation from app code, server code, and tests once root cause is confirmed.
- Be careful with controlled numeric inputs in Cypress. Avoid clear-and-retype patterns that can cause value append races; use a stable editable field when validating submit/update flow if numeric input behavior is flaky.
- Validate the end-to-end outcome, not only interaction steps: confirm the persisted row/card/content reflects the intended change after save/delete.
- Prefer inferred/shared types over one-off local interfaces in tests/routes/components. If types are needed, use existing exported/shared types before creating new local duplicates.

Readiness checks before running E2E:

- Confirm API is reachable on port 5000 (local dev) or configured port.
- Confirm web preview is reachable on port 4173.
- If either is unavailable, fix startup first instead of running tests.

### Frequent Validation (During Development)

Run these checks **frequently** while developing — not just before commits.
Catch issues early:

```bash
# After modifying any file, format it:
pnpm format

# After significant code changes, check types:
pnpm typecheck

# After adding new code, check for lint issues:
pnpm lint

# Periodically verify the build still works:
pnpm build
```

### Route Creation Workflow

When creating new route files in `apps/web/src/routes/`:

1. Create the route file
2. Run `pnpm --filter @apps/web dev` to start the dev server — TanStack Router
   will generate the route tree file (`routeTree.gen.ts`)
3. Stop the dev server (`Ctrl+C`)
4. Edit the generated route file with your component code
5. Run `pnpm format` to format the new/modified files
6. Run `pnpm typecheck` to verify types are correct

## Coding conventions

### TypeScript

- Strict mode enabled. No `any` — use `unknown` if unsure.
- Define explicit types for function parameters.
- Use double quotes, semicolons required.
- Prefer `const` over `let`.

### Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Database**: snake_case for tables/columns
- **Variables/functions**: camelCase

### Commit messages

Follow Conventional Commits: `<type>(<scope>): <subject>` Types: `feat`, `fix`,
`docs`, `style`, `refactor`, `perf`, `test`, `chore`

## Host Environment — Shell Aliases

The development machine has modern CLI replacements aliased over standard
commands. Agents should be aware of these when running terminal commands:

| Alias    | Actual Command                | Notes                                      |
| -------- | ----------------------------- | ------------------------------------------ |
| `ls`     | `eza -F --octal-permissions`  | Enhanced `ls` with file-type indicators    |
| `ll`     | `exa -lF --octal-permissions` | Long listing with permissions              |
| `cat`    | `bat -pp`                     | Syntax-highlighted output, no paging       |
| `find`   | `fdfind`                      | Faster find alternative                    |
| `grep`   | `rg` (ripgrep)                | Faster grep alternative                    |
| `du`     | `dust -b`                     | Disk usage viewer                          |
| `df`     | `duf -only local`             | Disk free viewer                           |
| `rm`     | `trash`                       | Moves to trash instead of permanent delete |
| `ps`     | `procs -w`                    | Process viewer                             |
| `top`    | `btop`                        | System monitor                             |
| `vi/vim` | `nvim`                        | Neovim                                     |
| `p`      | `pnpm`                        | Shorthand for pnpm                         |
| `zs`     | `source ~/.zshrc`             | Reload shell config                        |

**Key implications for agents:**

- `rm` is safe (trash, not permanent delete). Use `/bin/rm` if permanent delete
  is truly needed.
- `cat` output includes syntax highlighting via `bat`. Use `command cat` or
  `/bin/cat` if raw output is needed for piping.
- `grep` is `rg` — flags differ from GNU grep. Use `command grep` for POSIX
  grep.
- `find` is `fdfind` — syntax differs from GNU find. Use `command find` for
  POSIX find.

## Editing rules

1. **NEVER edit migration files** (`.sql` files in `drizzle/` directories).
   Create new migrations instead.
2. **NEVER use tRPC or React Query directly in React components** — use
   collection hooks from `~/lib/collections/`.
3. **ALWAYS run validation**
   (`pnpm format && pnpm lint && pnpm typecheck && pnpm build`) before
   committing.
4. **ALWAYS use pnpm** with `--frozen-lockfile` for installs.
5. When creating new routes in `apps/web/src/routes/`, run the dev server once
   to generate route types.

## Unit Testing (React Testing Library)

All React component tests in `apps/web/src/` use **Vitest** + **React Testing
Library (RTL)**. Follow Kent C. Dodds' principles:
https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

### The golden rule: never mock npm packages

> "The more your tests resemble the way users use your code, the more confidence
> they give you." — Kent C. Dodds

Mocking third-party packages (e.g. `@tanstack/react-router`,
`@tanstack/react-query`, `@headlessui/react`, `lucide-react`, Radix UI) gives
**false confidence**. The mock can fall out of sync with the real package API
while all tests continue to pass. Always use the real package.

**Only mock at true external boundaries:**

| What to mock | Why |
|---|---|
| `~/lib/auth.client` | Real network calls to the auth server |
| `~/lib/trpc.client` | Real network calls to the tRPC API |
| `~/lib/db.collections` | Real database/sync operations |
| `sonner` | Side-effect notification sink |
| `~/components/blocker` | Router-blocking behaviour tested separately |
| `~/components/markdown-editor` | Heavy third-party editor with its own tests |

**Never mock:** `@tanstack/react-router`, `@tanstack/react-query`,
`@headlessui/react`, `lucide-react`, `@packages/shared-ui/*`, `class-variance-authority`, or any other UI / utility npm package.

**Exception:** `react-youtube` is legitimately mocked because the YouTube
IFrame API is a browser-only runtime API that cannot work in JSDOM. Mock it
with a realistic `<iframe src="https://www.youtube.com/embed/{videoId}">`.

### Shared test utilities — `apps/web/src/test-utils.tsx`

```tsx
// Wraps with a REAL TanStack Router (memory history) + real QueryClient.
// Must be awaited: RouterProvider resolves its route tree asynchronously.
const { router, queryClient } = await renderWithProviders(<MyForm />);

// Router-less variant for components that don't need navigation.
const { queryClient } = renderWithQueryClient(<MentionPicker {...props} />);
```

All `it()` callbacks that call `renderWithProviders` **must** be `async` and
**must** `await` the call:

```tsx
it("renders the form", async () => {
  await renderWithProviders(<SignInForm />);
  expect(screen.getByLabelText("Email")).toBeInTheDocument();
});
```

### Navigation assertions

Instead of asserting on a mock `useNavigate` function, inspect the real router:

```tsx
// ✅ Proves the router actually navigated
const { router } = await renderWithProviders(<SignInForm />, {
  initialPath: "/signin",
});
await user.click(submitButton);
await waitFor(() =>
  expect(router.state.location.pathname).toBe("/dashboard"),
);

// ❌ Only proves navigate() was called — doesn't prove the route changed
expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
```

Note: TanStack Router URL-encodes special characters (e.g. `:` → `%3A`) in
`router.state.location.pathname`. Use a loose regex when the ID contains `:`:

```tsx
expect(router.state.location.pathname).toMatch(/^\/support\/suptick/);
```

### `vi.hoisted` for data shared with `vi.mock` factories

`vi.mock(...)` is **hoisted** above all variable declarations at compile time.
Any variable referenced inside a `vi.mock` factory must itself be hoisted using
`vi.hoisted`, or defined inline in the factory. Plain `const` declarations at
the top of the file are **not** yet available when the factory runs.

```tsx
// ✅ Correct: data defined via vi.hoisted so it's available when the factory runs
const { mockUsers } = vi.hoisted(() => ({
  mockUsers: [{ id: "1", name: "Alice" }],
}));
vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    mentions: {
      getChannelMentions: {
        queryOptions: vi.fn().mockReturnValue({
          queryKey: ["mentions"],
          queryFn: vi.fn().mockResolvedValue(mockUsers), // safe: hoisted
        }),
      },
    },
  },
}));

// ❌ Incorrect: plain const is not yet declared when the factory runs
const mockUsers = [{ id: "1", name: "Alice" }];
vi.mock("~/lib/trpc.client", () => ({
  trpc: { mentions: { getChannelMentions: { queryOptions: vi.fn().mockReturnValue({
    queryFn: vi.fn().mockResolvedValue(mockUsers), // undefined at hoist time!
  }) } } },
}));
```

### Query selectors — prefer accessible queries

| Priority | Query | Use when |
|---|---|---|
| 1 | `getByRole` | Buttons, links, headings, inputs with a label |
| 2 | `getByLabelText` | Form inputs associated with a `<label>` |
| 3 | `getByPlaceholderText` | Input placeholder (last resort) |
| 4 | `getByText` | Static text content |
| 5 | `getByDisplayValue` | Current value of form element |
| 6 | `getByTestId` | **Avoid**; only when no semantic alternative exists |

Never use `getByTestId` to query for icons or SVGs — that asserts an
implementation detail, not user-visible behaviour.

### `userEvent` over `fireEvent`

Always use `userEvent.setup()` instead of `fireEvent`. It simulates real browser
event sequences (focus, keydown, keyup, input, etc.) and catches more bugs:

```tsx
// ✅
const user = userEvent.setup();
await user.type(screen.getByLabelText("Email"), "test@example.com");
await user.click(screen.getByRole("button", { name: "Submit" }));

// ❌ Only fires a synthetic event — misses intermediate events
fireEvent.change(input, { target: { value: "test@example.com" } });
```

### Clipboard mocking

`userEvent.setup()` installs `navigator.clipboard` as a **getter-only**
property. Use `vi.spyOn` instead of `Object.assign`:

```tsx
// ✅
const writeSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();

// ❌ Throws "Cannot assign to read only property 'clipboard'"
Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
```

### Radix UI / HeadlessUI portals in JSDOM

Radix UI Popover, Dialog, and similar components render into a portal at
`document.body`. RTL's `screen.*` queries search the whole document, so they
**will** find portal content. No workaround needed.

However, Radix Tabs only renders the **active** tab's content into the DOM by
default. If you open a popover with tabs and assert on content in a non-default
tab, click that tab first:

```tsx
await user.click(screen.getByRole("button", { name: /sync status/i }));
const offlineTab = await screen.findByRole("tab", { name: /offline/i });
await user.click(offlineTab);
expect(screen.getByText("OfflineCollection")).toBeInTheDocument();
```



For deeper, context-specific guidance, see the instruction files in
`.github/instructions/`:

| File                                                  | Scope                         | Description                       |
| ----------------------------------------------------- | ----------------------------- | --------------------------------- |
| `00-setup-and-validation.instructions.md`             | All files                     | Setup and validation steps        |
| `a11y.instructions.md`                                | All files                     | Accessibility (WCAG 2.2 AA)       |
| `commit-message.instructions.md`                      | All files                     | Conventional Commits format       |
| `cypress-e2e.instructions.md`                         | `apps/web/cypress/**`         | E2E testing with Cypress          |
| `github-actions-ci-cd-best-practices.instructions.md` | `.github/workflows/*.yml`     | CI/CD pipeline patterns           |
| `markdown.instructions.md`                            | `**/*.md`                     | Documentation standards           |
| `performance-optimization.instructions.md`            | All files                     | Performance best practices        |
| `security-and-owasp.instructions.md`                  | All files                     | OWASP security guidelines         |
| `trpc-type-patterns.instructions.md`                  | Routers/queries/collections   | tRPC patterns and offline-first   |
| `typescript-node.instructions.md`                     | `apps/server/**`              | Fastify + Drizzle + tRPC patterns |
| `typescript-react.instructions.md`                    | `**/*.ts, **/*.tsx, **/*.css` | React + TanStack patterns         |
| `unit-testing-rtl.instructions.md`                    | `apps/web/src/**/*.test.*`    | RTL unit test standards           |

Reference documentation for detailed best practices is in `.github/docs/`:

- `a11y-reference.md` - Full accessibility patterns and code examples
- `library-patterns-reference.md` - Zod 4, Vitest 4, Drizzle, and testing
  gotchas
- `package-catalog.md` - Complete dependency inventory, versions, homepage
  links, node_modules paths, and usage patterns
- `performance-optimization-reference.md` - Comprehensive performance guide
- `ai-instructions-consistency.md` - Cross-file source of truth and exception
  map
- `doc-drift-checklist.md` - Pre-merge checklist to prevent instruction drift
