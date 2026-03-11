---
applyTo: "**"
description: "Setup, validation, and migration rules"
---

# Setup and Validation

## Initial Setup

```bash
npm install -g pnpm@10.30.3   # install pnpm if not found
pnpm install --frozen-lockfile # NEVER use npm or yarn
```

## Validation Before Every Commit

Make **all** edits first, then validate once as a chain:

```bash
pnpm format && pnpm lint && pnpm typecheck && pnpm build
```

All four must pass before committing. The `format` and `lint` scripts already
include `--cache` flags in the root `package.json` — never call `prettier --write`
or `eslint` directly without those flags, as it bypasses caching and is much slower.

## Database Migrations

**NEVER edit existing `.sql` migration files** in `drizzle/` directories — they
are immutable once created. To add or fix a migration, generate a new one:

```bash
cd apps/server && DATABASE_URL=postgresql://localhost:5432/dummy \
  pnpm dlx tsx node_modules/drizzle-kit/bin.cjs generate \
  --config src/drizzle.config.ts
```

`DATABASE_URL` must always be set to ensure the correct schema namespace (`"my_schema"`).

## Critical Rules

- Use `pnpm --frozen-lockfile` — never `npm install` or `yarn`
- Schema definitions must use `mySchema.table()` / `mySchema.enum()` (import `mySchema` from `~/db/my-schema.js`)
- After creating routes in `apps/web/src/routes/`, run `pnpm --filter @apps/web dev` once to regenerate `routeTree.gen.ts`
- Server relative imports use `.js` extension (ESM output); frontend imports omit extensions (Vite resolves)
- IDs use ULID (`import { ulid } from "ulid"`), not UUID
