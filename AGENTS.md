# Course Platform - Agent Guidance

This file provides guidance to AI coding agents (Claude Code, Cursor AI, Codex,
Gemini CLI, GitHub Copilot, and other AI coding assistants) when working with
code in this repository.

## What this repository is

This is a **full-stack TypeScript monorepo** for a course platform:

- **apps/web**: React 19 + Vite 7 + TanStack (Router, Query, Form, React-DB) + Tailwind CSS 4
- **apps/server**: Fastify 5 + tRPC 11 + Drizzle ORM + Better Auth
- **packages/shared-ui**: Radix UI component library
- **marketing/learn-fastify**: Astro static site

**Runtime requirements**: PostgreSQL 18, Redis/Dragonfly, Node.js >=22.16.0, pnpm 10

## High-level architecture

### 1) Frontend (`apps/web/`)

Single-page application with file-based routing and offline-first data layer.

```
apps/web/src/
├── routes/        # TanStack Router (file-based, auto code-split)
├── components/    # React components (PascalCase)
├── lib/
│   └── db.collections.ts  # ALL collection definitions + hooks — use in components
├── schema/        # Zod validation schemas
└── styles/        # Tailwind CSS styles
```

Key patterns:

- **Offline-first**: By default, app-facing data fetching should go through
  hooks in `~/lib/db.collections` (e.g. `useSupportTickets`, `useCourses`, etc.)
  rather than direct tRPC/React Query in components, so queries participate in
  the offline cache.
- **Exceptions**: Direct `trpc.*.useQuery` / `useQuery` + `trpc.*.queryOptions()`
  MAY be used for request-scoped or ephemeral data, admin-only pages, or other
  flows that are explicitly excluded from offline caching; follow the exception
  policy in `.github/instructions/trpc-type-patterns.instructions.md` and
  `.github/docs/ai-instructions-consistency.md`.
- **Collections**: Use `queryCollectionOptions` from `@tanstack/query-db-collection` +
  `createCollection` from `@tanstack/react-db`. Live queries via `useLiveQuery`.
- **File-based routing**: TanStack Router with `__root.tsx`, `index.tsx`,
  `$param.tsx`, `(group)/`, `_layout/` conventions.
- **Functional components**: ES5 function declarations (`function MyComponent()`
  not arrows).
- **No file extensions** in frontend imports (Vite handles resolution).
- **React Compiler**: `babel-plugin-react-compiler` is enabled — no need for manual
  `useMemo`/`useCallback` unless you have a measured performance reason.
- **Forms**: Use `@tanstack/react-form` with Zod validators.
- **IDs**: Internal entity IDs use ULID (`import { ulid } from "ulid"`). UUIDs are
  fine for external system identifiers and non-entity values (e.g. config values,
  temporary filenames).

### 2) Backend (`apps/server/`)

REST + tRPC API server with PostgreSQL database.

```
apps/server/src/
├── routes/        # Fastify REST routes (handlers/ subdirectory per feature)
├── routers/       # tRPC routers (queries.ts + mutations.ts per domain)
├── db/
│   ├── schema/    # Drizzle table definitions (flat, one file per entity)
│   ├── queries/   # Module-scoped prepared statements + type exports
│   └── mutations/ # Write operations
└── lib/
    ├── cache.ts      # async-cache-dedupe with Redis (reference-based invalidation)
    └── sse-sync.ts   # Redis Streams for real-time SSE sync
```

Key patterns:

- **Drizzle ORM**: Schemas use `mySchema.table()` / `mySchema.enum()` from `~/db/my-schema.js`.
  All tables include `...timestamps` from `~/db/schema/columns.helpers.js`.
- **Prepared statements**: MUST be module-scoped (top-level), NEVER function-scoped.
  Use `db.query.tableName.findMany({ ... }).prepare("uniqueName")`.
- **Type exports**: `export type AllItems = Awaited<ReturnType<typeof getAllItems>>` in every query file.
- **Cache layer**: `async-cache-dedupe` wraps hot DB reads. After mutations:
  `fastify.cache.invalidateAll(["entity~all", "entity~id~{id}"])`.
- **Error handling**: Use `fastify.to(promise)` from `@fastify/sensible` for `[err, result]`
  tuples instead of try/catch in route handlers.
- **`.js` extension** required for all relative imports (TypeScript compiles to ESM).
- **Path alias**: `~/` maps to `src/`.

### 3) Shared UI (`packages/shared-ui/`)

Radix UI component library shared across apps.

### 4) Marketing (`marketing/learn-fastify/`)

Astro static site for the learn-fastify course marketing page.

## Common commands

Run from repository root. **Always use pnpm** (never npm or yarn).

```bash
# Setup
npm install -g pnpm@10.30.3        # Install pnpm (if not available)
pnpm install --frozen-lockfile      # Install dependencies

# Development
pnpm dev                            # All apps concurrently
pnpm --filter @apps/web dev         # Frontend only (port 4173)
pnpm --filter @apps/server dev      # Backend only (port 5000)

# Validation (REQUIRED before every commit — run as a single chain)
pnpm format && pnpm lint && pnpm typecheck && pnpm build
#   pnpm format uses --cache --cache-location .cache/prettier
#   pnpm lint uses --cache --cache-location .cache/eslint --cache-strategy content
#   Never call prettier/eslint directly without these flags — it's much slower
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
3. Confirm both are ready (`http://localhost:5000` and `http://localhost:4173`)
4. Run only changed spec files:
   `pnpm --filter @apps/web e2e:run -- --spec "cypress/e2e/<changed-spec>.cy.ts"`
5. Stop servers when finished; confirm ports 5000 and 4173 are freed

Key guardrails:

- **ALWAYS scan the actual implementation** before writing tests — read page
  components, form fields, and button text. Never invent selector names.
- **Never use `cy.request()`** for auth setup — drive all flows through the real UI.
- **Never mock/stub responses** with `cy.intercept()` — only use it to observe/wait
  on real network calls (e.g. `cy.wait("@createTicket")`).
- **Authorization**: non-admin navigating to `/admin/*` — assert route-level denial
  and user-facing error, then stop. Do NOT force mutation-level tests from a blocked
  page. Add server-side Vitest tests for the actual endpoint guards instead.
- **CRUD cleanup** must go through the normal UI delete flow (doubles as delete-path coverage).
- Known failure: bare `pnpm preview` from repo root fails — always use
  `pnpm --filter @apps/web preview`.

For full authorization testing patterns and stabilization practices, see
`.github/instructions/cypress-e2e.instructions.md`.

### Route Creation Workflow

When creating new route files in `apps/web/src/routes/`:

1. Create the route file
2. Run `pnpm --filter @apps/web dev` to start the dev server — TanStack Router
   will generate the route tree file (`routeTree.gen.ts`)
3. Stop the dev server (`Ctrl+C`)
4. Edit the generated route file with your component code
5. Run `pnpm format && pnpm typecheck` to verify

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

## Workspace Temp Directory Policy

Use a repository-local temp directory for run artifacts:

- Prefer `./tmp/` instead of global `/tmp/` for intermediate logs and generated
  files.
- Create per-run subdirectories in `./tmp/` (for example
  `./tmp/<task-or-date>/`) so concurrent runs do not collide.
- Clean up `./tmp/` artifacts after each run, or keep them isolated in
  run-specific folders that can be removed safely.
- Only use global `/tmp/` when a tool strictly requires it.

## Editing rules

1. **NEVER edit migration files** (`.sql` files in `drizzle/` directories).
   Create new migrations instead.
2. **NEVER use tRPC or React Query directly in React components** — use
   collection hooks from `~/lib/db.collections`.
3. **ALWAYS run validation**
   (`pnpm format && pnpm lint && pnpm typecheck && pnpm build`) before
   committing.
4. **ALWAYS use pnpm** with `--frozen-lockfile` for installs.
5. **IDs** use ULID (`import { ulid } from "ulid"`), never UUID or `crypto.randomUUID()`.
6. When creating new routes in `apps/web/src/routes/`, run the dev server once
   to generate route types.

## Unit Testing (React Testing Library)

All React component tests use **Vitest** + **RTL**. The single overriding rule:

**Never mock npm packages** (`@tanstack/react-router`, `@tanstack/react-query`,
`@headlessui/react`, `lucide-react`, Radix UI, etc.). Use the real packages.

Only mock true external boundaries:

| What to mock                   | Why                                         |
| ------------------------------ | ------------------------------------------- |
| `~/lib/auth.client`            | Real network calls to the auth server       |
| `~/lib/trpc.client`            | Real network calls to the tRPC API          |
| `~/lib/db.collections`         | Real database/sync operations               |
| `sonner`                       | Side-effect notification sink               |
| `~/components/blocker`         | Router-blocking behaviour tested separately |
| `~/components/markdown-editor` | Heavy third-party editor with its own tests |

Exception: `react-youtube` — YouTube IFrame API is browser-only; mock as
`<iframe src="https://www.youtube.com/embed/{videoId}">`.

Key rules:

- `renderWithProviders` is **async** — always `await` it; `it()` must be `async`.
- **Navigation**: assert on `router.state.location.pathname`, never on a mocked
  `useNavigate`. TanStack Router URL-encodes `:` as `%3A` — use a regex for IDs
  containing colons: `expect(path).toMatch(/^\/support\/suptick/)`.
- **`vi.mock` factories**: any data used inside must be created with `vi.hoisted()`,
  not declared as a plain `const` (factories are hoisted above all declarations).
- **Interactions**: always use `userEvent.setup()`, never `fireEvent`.
- **Clipboard**: `vi.spyOn(navigator.clipboard, "writeText")` — not `Object.assign`.
- **Selectors**: `getByRole` → `getByLabelText` → `getByText` → avoid `getByTestId`.

For full examples, patterns, and checklists see
`.github/instructions/unit-testing-rtl.instructions.md`.

## Instruction Files Reference

| File | Scope | Description |
| ---- | ----- | ----------- |
| `00-setup-and-validation.instructions.md` | All files | Setup and validation steps |
| `a11y.instructions.md` | All files | Accessibility (WCAG 2.2 AA) |
| `commit-message.instructions.md` | All files | Conventional Commits format |
| `cypress-e2e.instructions.md` | `apps/web/cypress/**` | E2E testing with Cypress |
| `github-actions-ci-cd-best-practices.instructions.md` | `.github/workflows/*.yml` | CI/CD pipeline patterns |
| `markdown.instructions.md` | `**/*.md` | Documentation standards |
| `performance-optimization.instructions.md` | All files | Performance best practices |
| `security-and-owasp.instructions.md` | All files | OWASP security guidelines |
| `trpc-type-patterns.instructions.md` | Routers/queries/collections | tRPC patterns and offline-first |
| `typescript-node.instructions.md` | `apps/server/**` | Fastify + Drizzle + tRPC patterns |
| `typescript-react.instructions.md` | `**/*.ts, **/*.tsx, **/*.css` | React + TanStack patterns |
| `unit-testing-rtl.instructions.md` | `apps/web/src/**/*.test.*` | RTL unit test standards |

Reference documentation in `.github/docs/`:

- `library-patterns-reference.md` — Zod 4, async-cache-dedupe, TanStack React-DB, TanStack Form, Vitest 4
- `a11y-reference.md` — Full accessibility patterns and code examples
- `package-catalog.md` — Complete dependency inventory with versions and usage notes
- `performance-optimization-reference.md` — Comprehensive performance guide
- `ai-instructions-consistency.md` — Cross-file source of truth and exception map
- `doc-drift-checklist.md` — Pre-merge checklist to prevent instruction drift
