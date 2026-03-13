---
applyTo: "**"
description: "Project overview, commands, and critical rules for the course platform"
---

# Course Platform

Full-stack TypeScript monorepo for a course platform.

| Workspace | Package | Stack |
|-----------|---------|-------|
| `apps/web` | `@apps/web` | React 19, Vite 7, TanStack (Router, Query, Form, React-DB), Tailwind CSS 4 |
| `apps/server` | `@apps/server` | Fastify 5, tRPC 11, Drizzle ORM, Better Auth, PostgreSQL 18 |
| `packages/shared-ui` | `@packages/shared-ui` | Radix UI component library |
| `marketing/learn-fastify` | `@marketing/learn-fastify` | Astro 5 static site |

**Runtime**: Node.js >=22.16.0, PostgreSQL 18, Redis/Dragonfly, pnpm 10

## Commands

```bash
# Setup
npm install -g pnpm@10.30.3      # install pnpm if not found
pnpm install --frozen-lockfile   # NEVER use npm or yarn

# Validation — make ALL edits first, then run once as a chain
pnpm format && pnpm lint && pnpm typecheck && pnpm build

# Development
pnpm dev                         # all apps concurrently
pnpm --filter @apps/web dev      # frontend (port 4173)
pnpm --filter @apps/server dev   # backend (port 5000)

# Testing
pnpm test                        # all Vitest tests
pnpm --filter @apps/web e2e:run  # Cypress headless

# Database migrations — DATABASE_URL required
cd apps/server && DATABASE_URL=postgresql://localhost:5432/dummy \
  pnpm dlx tsx node_modules/drizzle-kit/bin.cjs generate \
  --config src/drizzle.config.ts
pnpm --filter @apps/server drizzle:migrate
```

The `format` and `lint` scripts already use `--cache` flags — never call
`prettier --write` or `eslint` directly without those flags.

## Critical Rules

1. **Never edit migration `.sql` files** in `drizzle/` — they are immutable.
2. **Never use tRPC or React Query directly in components** — use collection hooks from `~/lib/db.collections`.
3. **Always run** `pnpm format && pnpm lint && pnpm typecheck && pnpm build` before committing.
4. **Always use pnpm** with `--frozen-lockfile`.
5. **New routes** in `apps/web/src/routes/` require running the dev server once to regenerate `routeTree.gen.ts`.
6. **IDs** use ULID (`import { ulid } from "ulid"`); UUIDs are fine for external/non-entity identifiers.
7. **Server imports** use `.js` extension (ESM); **frontend imports** omit extensions (Vite resolves).
8. **Prepared statements** must be module-scoped (top-level), never inside functions.
9. **Scratch files/logs** must be stored under repository-local `tmp/` (for example `tmp/<task>/`) and not system `/tmp`.
10. **Commit messages** follow Conventional Commits: `<type>(<scope>): <subject>`.
11. **Fastify plugins that add `fastify.*` decorators** — the project uses `encapsulate: false`
    in `@fastify/autoload` (see `server.ts`). For individual plugins outside autoload, use
    `fastify-plugin` (`fp`) so the decorator is visible outside the plugin scope.
12. **Structured logging** — always pass an object first: `request.log.info({ userId }, "msg")`.
    Use `request.log` (not `app.log`) inside handlers for automatic request-ID correlation.
    Use `fastify.log` only in plugin-level code with no per-request context.
13. **Do NOT re-call `closeWithGrace()`** inside `process.on('uncaughtException')` — only log
    the error. The existing `closeWithGrace` handler handles all shutdown cleanup.
14. **Filenames and folder names** must use kebab-case (hyphenated lowercase) — e.g. `sync-status-indicator.tsx`, `use-sse-sync.ts`, `report-web-vitals.ts`. Never use PascalCase or camelCase for file or folder names.

## Architecture

```
apps/web/src/
├── routes/           # TanStack Router (file-based, auto code-split)
├── components/       # React components (kebab-case filenames, PascalCase exports)
├── lib/
│   └── db.collections.ts  # ALL collection definitions + hooks
└── schema/           # Zod validation schemas

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
```

**Key decisions**: Offline-first via collections, `async-cache-dedupe` cache
layer, SSE sync via Redis Streams, React Compiler (no manual memoization),
Vite code splitting with `manualChunks`.

## Instruction Files

Detailed coding patterns are in `.github/instructions/`, auto-applied by file path.
Reference docs are in `.github/docs/`. See `AGENTS.md` for the full map.
