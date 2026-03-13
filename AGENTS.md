# Course Platform - Agent Guidance

This file provides guidance to AI coding agents (Claude Code, Cursor AI, Codex,
Gemini CLI, GitHub Copilot, and other AI coding assistants) when working with
code in this repository.

## What This Repository Is

A **full-stack TypeScript monorepo** for a course platform:

| Workspace                 | Package                    | Stack                                                                      |
| ------------------------- | -------------------------- | -------------------------------------------------------------------------- |
| `apps/web`                | `@apps/web`                | React 19, Vite 7, TanStack (Router, Query, Form, React-DB), Tailwind CSS 4 |
| `apps/server`             | `@apps/server`             | Fastify 5, tRPC 11, Drizzle ORM, Better Auth, PostgreSQL 18                |
| `packages/shared-ui`      | `@packages/shared-ui`      | Radix UI component library                                                 |
| `marketing/learn-fastify` | `@marketing/learn-fastify` | Astro 5 static site                                                        |

**Runtime requirements**: Node.js >=22.16.0, PostgreSQL 18, Redis/Dragonfly,
pnpm 10

## Commands

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

# Testing
pnpm test                           # All tests (Vitest)
pnpm --filter @apps/server test     # Server tests only
pnpm --filter @apps/web test        # Web tests only
pnpm --filter @apps/web e2e         # Cypress interactive
pnpm --filter @apps/web e2e:run     # Cypress headless

# Database (Drizzle)
cd apps/server && DATABASE_URL=postgresql://localhost:5432/dummy \
  pnpm dlx tsx node_modules/drizzle-kit/bin.cjs generate \
  --config src/drizzle.config.ts
pnpm --filter @apps/server drizzle:migrate
```

The `format` and `lint` scripts already include `--cache` flags in root
`package.json` — never call `prettier --write` or `eslint` directly without
those flags.

## Critical Rules

1. **Never edit migration `.sql` files** in `drizzle/` — they are immutable.
2. **Never use tRPC or React Query directly in components** — use collection
   hooks from `~/lib/db.collections`.
3. **Always run** `pnpm format && pnpm lint && pnpm typecheck && pnpm build`
   before committing.
4. **Always use pnpm** with `--frozen-lockfile`.
5. **New routes** in `apps/web/src/routes/` require running the dev server once
   to regenerate `routeTree.gen.ts`.
6. **IDs** use ULID (`import { ulid } from "ulid"`); UUIDs are fine for
   external/non-entity identifiers.
7. **Server imports** use `.js` extension (ESM); **frontend imports** omit
   extensions (Vite resolves).
8. **Prepared statements** must be module-scoped (top-level), never inside
   functions.
9. **Drizzle schemas** use `mySchema.table()` / `mySchema.enum()` — import
   `mySchema` from `~/db/my-schema.js`.
10. **Scratch files/logs** must be stored under repository-local `tmp/` (for
    example `tmp/<task>/`) and not system `/tmp`.
11. **Commit messages** follow Conventional Commits:
    `<type>(<scope>): <subject>`.
12. **Fastify plugins that add `fastify.*` decorators** — the project uses `encapsulate: false`
    in `@fastify/autoload` so all plugins in `plugins/app/` and `plugins/external/` share the
    same scope. For individual plugins outside autoload, use `fastify-plugin` (`fp`).
13. **Fastify TypeScript decorators** require `declare module "fastify"` augmentation in
    `apps/server/types/fastify.d.ts` — extend `FastifyInstance` / `FastifyRequest` so the
    compiler knows about `fastify.db`, `fastify.cache`, `request.user`, etc.
14. **Structured logging** — use `request.log` (not `fastify.log`) inside route handlers and
    tRPC procedures; always pass an object first (`request.log.info({ userId }, "message")`),
    never a bare error without a message or an interpolated string. Use `fastify.log` only in
    plugin-level code with no per-request context.
15. **Do NOT re-call `closeWithGrace()`** inside `process.on('uncaughtException')` — it
    re-registers handlers and immediately ends the DB pool, crashing in-flight requests.
    Log the error and let the existing `closeWithGrace` handler do the cleanup.
16. **`async` only when `await` is needed** — `async` wraps the return in a Promise (extra
    allocation per call). Use callback (`done`) style for synchronous hooks/plugins; only use
    `async` when the body contains `await`. Never mix `async` + `done()`.
17. **Filenames and folder names** must use kebab-case (hyphenated lowercase) —
    e.g. `sync-status-indicator.tsx`, `use-sse-sync.ts`, `report-web-vitals.ts`.
    Never use PascalCase or camelCase for file or folder names.

## Architecture

### Frontend (`apps/web/`)

```
apps/web/src/
├── routes/           # TanStack Router (file-based, auto code-split)
├── components/       # React components (kebab-case filenames, PascalCase exports)
├── lib/
│   └── db.collections.ts  # ALL collection definitions + hooks
├── schema/           # Zod validation schemas
└── styles/           # Tailwind CSS styles
```

- **Offline-first**: Data fetching goes through `~/lib/db.collections` hooks
  (e.g. `useSupportTickets`, `useCourses`), never direct tRPC/React Query.
- **Collections**: `queryCollectionOptions` + `createCollection` +
  `useLiveQuery`.
- **File-based routing**: `__root.tsx`, `index.tsx`, `$param.tsx`, `(group)/`,
  `_layout/`.
- **React Compiler**: `babel-plugin-react-compiler` is enabled — no manual
  `useMemo`/`useCallback`.
- **Forms**: `@tanstack/react-form` with Zod validators.

### Backend (`apps/server/`)

```
apps/server/src/
├── routes/           # Fastify REST routes
├── routers/          # tRPC routers (queries.ts + mutations.ts per domain)
├── db/
│   ├── schema/       # Drizzle tables (one file per entity)
│   ├── queries/      # Module-scoped prepared statements + type exports
│   └── mutations/    # Write operations
└── lib/
    ├── cache.ts      # async-cache-dedupe with Redis
    └── sse-sync.ts   # Redis Streams for real-time SSE sync

apps/server/types/
└── fastify.d.ts      # declare module "fastify" — FastifyInstance/FastifyRequest augmentation
```

- **Cache layer**: `async-cache-dedupe` wraps DB reads; invalidate with
  `cache.invalidateAll([refs])`.
- **Error handling**: Use `fastify.to(promise)` for `[err, result]` tuples.
  `@fastify/sensible` reply helpers (`reply.notFound()`, `reply.badRequest()`) cover most cases;
  for typed error classes, add `@fastify/error`.
- **Graceful shutdown**: `close-with-grace` handles SIGTERM/SIGINT. Cleanup order:
  external connections first, then `app.close()`. Never re-call `closeWithGrace` inside
  `uncaughtException`.
- **Real-time sync**: SSE via Redis Streams.

## Coding Conventions

- **TypeScript**: Strict mode, no `any`, double quotes, semicolons, `const` over
  `let`.
- **Naming**: PascalCase components, camelCase variables/functions, snake_case
  DB tables/columns.
- **Components**: ES5 function declarations (`function MyComponent() {}`).
- **Type exports**: `export type AllItems = Awaited<ReturnType<typeof fn>>`.

## E2E Workflow

1. Start backend: `pnpm --filter @apps/server dev`
2. Start frontend preview: `pnpm --filter @apps/web preview`
3. Run changed specs:
   `pnpm --filter @apps/web e2e:run -- --spec "cypress/e2e/<spec>.cy.ts"`

Key guardrails:

- **tRPC uses POST** (`httpBatchStreamLink`) — always
  `cy.intercept("POST", ...)`, never GET.
- **Register intercepts before** `cy.visit()`.
- **Never mock/stub** with `cy.intercept()` — only observe/wait.
- **CRUD cleanup** via normal UI delete flow.

## Unit Testing (React Testing Library)

**Never mock npm packages.** Only mock network/database boundaries:
`~/lib/auth.client`, `~/lib/trpc.client`, `~/lib/db.collections`, `sonner`,
`~/components/blocker`, `~/components/markdown-editor`.

Key rules:

- `renderWithProviders` is **async** — always `await` it.
- Assert navigation via `router.state.location.pathname`.
- Use `vi.hoisted()` for data in `vi.mock` factories.
- Use `userEvent.setup()`, never `fireEvent`.

## Host Environment — Shell Aliases

| Alias  | Actual Command | Notes                                    |
| ------ | -------------- | ---------------------------------------- |
| `cat`  | `bat -pp`      | Use `command cat` for raw output         |
| `grep` | `rg` (ripgrep) | Use `command grep` for POSIX grep        |
| `find` | `fdfind`       | Use `command find` for POSIX find        |
| `rm`   | `trash`        | Safe delete; use `/bin/rm` for permanent |

## Instruction Files

Detailed coding patterns are in `.github/instructions/`, auto-applied by file
path. Reference docs are in `.github/docs/`.

| File                                 | Scope                           |
| ------------------------------------ | ------------------------------- |
| `a11y.instructions.md`               | `**/*.tsx`                      |
| `commit-message.instructions.md`     | `**`                            |
| `cypress-e2e.instructions.md`        | `apps/web/cypress/**`           |
| `github-actions.instructions.md`     | `.github/workflows/*.yml`       |
| `markdown.instructions.md`           | `**/*.md`                       |
| `performance.instructions.md`        | `**/*.ts, **/*.tsx`             |
| `security.instructions.md`           | `**/*.ts, **/*.tsx`             |
| `trpc-type-patterns.instructions.md` | Routers/queries/collections     |
| `typescript-node.instructions.md`    | `apps/server/**`                |
| `typescript-react.instructions.md`   | `apps/web/**/*.ts,tsx,css` etc. |
| `unit-testing-rtl.instructions.md`   | `apps/web/src/**/*.test.*`      |

Reference docs in `.github/docs/`:

- `library-patterns-reference.md` — Zod 4, async-cache-dedupe, TanStack, Vitest
- `a11y-reference.md` — Accessibility patterns and code examples
- `performance-optimization-reference.md` — Performance guide
- `package-catalog.md` — Dependency inventory with versions
