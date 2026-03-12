---
applyTo: "**"
description: "Coding agent instructions for the course platform"
---

# Course Platform - Coding Agent Instructions

## Project Overview

Full-stack TypeScript monorepo:
- **apps/web**: React 19 + Vite 7 + TanStack (Router, Query, Form, React-DB) + Tailwind CSS 4
- **apps/server**: Fastify 5 + tRPC 11 + Drizzle ORM + Better Auth
- **packages/shared-ui**: Radix UI component library
- **marketing/learn-fastify**: Astro static site

**Runtime**: Node.js >=22.16.0, PostgreSQL 18, Redis/Dragonfly, pnpm 10

---

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

`pnpm format` and `pnpm lint` already use `--cache` flags in the root `package.json` scripts
(`--cache-location .cache/prettier` and `--cache-location .cache/eslint --cache-strategy content`).
Never call `prettier --write` or `eslint` directly without those flags.

---

## Critical Rules

1. **Never edit migration `.sql` files** in `drizzle/` — they are immutable. Create new migrations instead.
2. **Never use tRPC or React Query directly in components** — use collection hooks from `~/lib/db.collections`.
3. **Always run** `pnpm format && pnpm lint && pnpm typecheck && pnpm build` before committing.
4. **Always use pnpm** with `--frozen-lockfile`.
5. **New routes** in `apps/web/src/routes/` require running the dev server once to regenerate `routeTree.gen.ts`.
6. **`DATABASE_URL`** must be set when generating Drizzle migrations.
7. **Drizzle schemas** use `mySchema.table()` / `mySchema.enum()` — import `mySchema` from `~/db/my-schema.js`.
8. **IDs** use ULID (`import { ulid } from "ulid"`), never UUID.
9. **Server** relative imports use `.js` extension (ESM output); frontend imports omit extensions (Vite resolves).
10. **Prepared statements** must be module-scoped (top-level), never inside functions.

---

## Architecture

```
apps/web/src/
├── routes/        # TanStack Router (file-based, auto code-split)
├── components/    # React components (PascalCase)
├── lib/
│   └── db.collections.ts  # ALL collection definitions + hooks ← use in components
└── schema/        # Zod validation schemas

apps/server/src/
├── routes/        # Fastify REST routes (handlers/ subdirectory per feature)
├── routers/       # tRPC routers (queries.ts + mutations.ts per domain)
├── db/
│   ├── schema/    # Drizzle tables (flat, one file per entity)
│   ├── queries/   # Module-scoped prepared statements + type exports
│   └── mutations/ # Write operations
└── lib/
    ├── cache.ts      # async-cache-dedupe with Redis (reference-based invalidation)
    └── sse-sync.ts   # Redis Streams for real-time SSE sync
```

Key architectural decisions:
- **Offline-first**: ALL component data access goes through `~/lib/db.collections` hooks (never direct tRPC).
- **Cache layer**: `async-cache-dedupe` wraps all DB reads; mutations call `cache.invalidateAll([refs])`.
- **Real-time sync**: SSE via Redis Streams — `publishEntityChange` → `streamEntityUpdates` → tRPC subscription.
- **React Compiler**: Enabled via `babel-plugin-react-compiler` — avoid redundant `useMemo`/`useCallback`.
- **Code splitting**: Vite `manualChunks` splits bundles for react, tanstack-router, tanstack-query,
  tanstack-db, trpc, auth, ui-libs, forms, icons, markdown, etc.

---

## Specialized Instruction Files

Automatically applied based on file path:

| File | Scope | What it covers |
|------|-------|----------------|
| `00-setup-and-validation.instructions.md` | All files | Setup, validation, migration rules |
| `a11y.instructions.md` | All files | WCAG 2.2 AA accessibility |
| `commit-message.instructions.md` | All files | Conventional Commits |
| `cypress-e2e.instructions.md` | `apps/web/cypress/**` | E2E test patterns |
| `github-actions-ci-cd-best-practices.instructions.md` | `.github/workflows/*.yml` | CI/CD |
| `markdown.instructions.md` | `**/*.md` | Documentation |
| `performance-optimization.instructions.md` | All files | Performance guidelines |
| `security-and-owasp.instructions.md` | All files | OWASP security |
| `trpc-type-patterns.instructions.md` | Routers/queries/collections | tRPC + offline-first data layer |
| `typescript-node.instructions.md` | `apps/server/**` | Fastify + Drizzle + tRPC patterns |
| `typescript-react.instructions.md` | Web/packages `**/*.ts,tsx,css` | React + TanStack patterns |
| `unit-testing-rtl.instructions.md` | `apps/web/src/**/*.test.*` | RTL unit test standards |

Reference docs in `.github/docs/`:
- `library-patterns-reference.md` — Zod 4, async-cache-dedupe, TanStack React-DB, TanStack Form, Vitest 4
- `a11y-reference.md` — Full accessibility patterns and code examples
- `performance-optimization-reference.md` — Comprehensive performance guide
- `package-catalog.md` — Full dependency inventory with versions and usage notes
