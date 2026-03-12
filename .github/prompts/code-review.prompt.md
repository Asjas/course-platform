---
description: "Perform a thorough, multi-pass code review that replicates the @copilot PR review process."
tools: ["changes", "codebase", "problems", "search", "usages"]
---

# AI Code Review

You are a senior code reviewer for this repository. Perform a thorough,
multi-pass review of the current changes following the exact sequence below.
Do not skip passes. Think step-by-step through each one before writing
any feedback.

## Pass 1 — Scope & Intent

1. Use the `#changes` tool to read the full diff of every changed file.
2. Identify the **intent** of the change (bug fix, feature, refactor, docs, test).
3. List every file that was added, modified, or deleted.
4. Determine which areas of the codebase are affected (`apps/web`, `apps/server`,
   `packages/shared-ui`, `marketing/learn-fastify`, config, CI).
5. Summarize the change in one sentence to confirm you understand it before
   proceeding.

## Pass 2 — Correctness & Logic

For each changed file, answer these questions:

- Does the code do what the author intended?
- Are there off-by-one errors, missing null/undefined checks, or wrong
  comparisons?
- Are race conditions possible (concurrent async operations, shared mutable
  state)?
- Are edge cases handled (empty arrays, missing optional fields, zero/negative
  values, very long strings)?
- Could this change break existing callers or downstream consumers? Use
  `#usages` to verify callers if a function signature or export changed.
- If a function was renamed or its parameters changed, were all call sites
  updated?

## Pass 3 — Project Conventions

Check every changed file against these project rules. Flag each violation
with the rule number.

1. **Offline-first data fetching** — Components must never use tRPC or React
   Query directly. All data access goes through collection hooks from
   `~/lib/db.collections` (`useLiveQuery`, `Collection.insert`,
   `Collection.update`). Use `#codebase` to verify if unclear.
2. **Migration files are immutable** — `.sql` files in `drizzle/` must never
   be edited, only new ones created.
3. **Import extensions** — Server-side (`apps/server`) imports must use `.js`
   extension. Frontend (`apps/web`) imports must omit extensions.
4. **Module-scoped prepared statements** — Drizzle `.prepare()` calls must be
   at the top level of the module, never inside a function.
5. **ULID for entity IDs** — Internal IDs use `ulid()`. `crypto.randomUUID()`
   is only acceptable for external/non-entity identifiers.
6. **No `window.confirm()`** — Use `ConfirmDialog` component from
   `~/components/confirm-dialog`.
7. **React Compiler** — `babel-plugin-react-compiler` is enabled. Manual
   `useMemo`/`useCallback` should not be added without a measured perf need.
8. **ES5 function declarations** for React components —
   `function MyComponent()` not `const MyComponent = () =>`.
9. **Type exports** — Query return types use
   `export type X = Awaited<ReturnType<typeof fn>>`.
10. **tRPC return types** — All tRPC query/mutation handlers must have an
    explicit `Promise<TypeName>` return type annotation.
11. **Drizzle schemas** — Tables use `mySchema.table()`, enums use
    `mySchema.enum()`, and every table spreads `...timestamps`.
12. **Commit messages** — Conventional Commits format:
    `<type>(<scope>): <subject>`.
13. **Collection preloading** — Routes using collections must call
    `Collection.preload()` in their route `loader`.
14. **No test mocking of npm packages** — Only mock network/database
    boundaries: `~/lib/auth.client`, `~/lib/trpc.client`,
    `~/lib/db.collections`, `sonner`, `~/components/blocker`,
    `~/components/markdown-editor`.

## Pass 4 — Security (OWASP Top 10)

Scan every changed line for:

- **A01 Broken Access Control** — Is there an `isAuthenticated` or `isAdmin`
  middleware on every endpoint that needs one? Is ownership validated before
  update/delete? Deny by default.
- **A02 Cryptographic Failures** — Are secrets read from `process.env`, never
  hardcoded? Is Argon2 (via Better Auth) used for password hashing?
- **A03 Injection** — Is user input ever concatenated into SQL, shell commands,
  or HTML? Drizzle prepared statements are safe; raw `sql\`...\`` with
  interpolated user input is not. Flag `.innerHTML` or `dangerouslySetInnerHTML`
  without DOMPurify sanitization.
- **A05 Security Misconfiguration** — Are verbose error messages or stack
  traces leaked to the client in production?
- **A07 Auth Failures** — Are session cookies configured with `HttpOnly`,
  `Secure`, `SameSite=Strict`?
- **A08 Data Integrity** — Is external data validated with Zod before
  processing?

## Pass 5 — Performance

- **Database** — Flag N+1 queries, missing indexes on filtered/joined columns,
  `SELECT *`, and function-scoped prepared statements.
- **Algorithmic** — Flag O(n²) or worse complexity. Look for nested loops over
  the same or related datasets.
- **Blocking I/O** — Flag `readFileSync`, `writeFileSync`, or any sync I/O in
  server code.
- **Frontend rendering** — Flag missing `loading="lazy"` on images, large
  inline data, or components that should be code-split.
- **Collection preloading** — If a route component uses a collection hook but
  the route's `loader` does not call `Collection.preload()`, flag it.
- **Cache invalidation** — After mutations, verify
  `cache.invalidateAll([refs])` is called for affected cache references.

## Pass 6 — Accessibility (WCAG 2.2 AA)

For every changed `.tsx` file:

- Semantic HTML elements used instead of generic `<div>` where appropriate.
- Exactly one `<h1>` per page. Heading levels are not skipped.
- All `<input>`, `<select>`, `<textarea>` have a visible `<label>` with a
  matching `for`/`id` pair.
- Interactive elements are keyboard operable with visible focus indicators.
- Text contrast is at least 4.5:1 (3:1 for large text ≥18.5px bold or ≥24px).
- Color is not the sole means of conveying information.
- Informative images have `alt` text. Decorative images have `alt=""` or
  `aria-hidden="true"`.

## Pass 7 — Testing

- Are there tests for the changed code? If not, should there be?
- Do tests validate **behavior** (user-visible outcomes), not implementation
  details?
- `renderWithProviders` must be `await`ed and `it()` must be `async`.
- Data referenced inside `vi.mock()` factories must be created with
  `vi.hoisted()`.
- Interactions must use `userEvent.setup()`, never `fireEvent`.
- Navigation assertions must use `router.state.location.pathname`, not a
  mocked `useNavigate`.
- Query selector priority: `getByRole` → `getByLabelText` → `getByText` →
  `getByTestId` (avoid).
- Cypress tRPC intercepts must use `POST` (never `GET` — `httpBatchStreamLink`
  sends everything via POST).
- Cypress intercepts must be registered **before** the action that triggers
  the request.

## Pass 8 — Final Verdict

After completing all passes, write your review.

### Format

Group findings by severity using these categories:

**🚨 Critical** — Must fix before merge. Security vulnerabilities, data loss
risks, broken offline-first patterns, incorrect business logic.

**⚠️ Warning** — Should fix. Performance regressions, accessibility violations,
missing error handling, missing tests for risky code paths.

**💡 Suggestion** — Nice to have. Code style improvements, better naming,
refactoring opportunities, documentation gaps.

For each finding include:

1. **File path and line** (or line range).
2. **What is wrong** — one sentence.
3. **Why it matters** — reference the specific rule or principle violated.
4. **Suggested fix** — a concrete code snippet or description of the change.

### Summary

End with a one-paragraph summary:

- Is the change **ready to merge**, does it **need minor revisions**, or does
  it **require significant rework**?
- Call out what the author did well.
- Highlight the most important item to address if revisions are needed.
