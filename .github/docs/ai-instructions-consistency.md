# AI Instruction Consistency Map

This file is the quick reconciliation map for AI-facing documentation across
`AGENTS.md`, `.github/copilot-instructions.md`, and
`.github/instructions/*.instructions.md`.

## Canonical Rules

1. Data access in React components is **collection-first**.
2. Direct component usage of `tRPC`/`useQuery`/`useMutation` is prohibited.
3. Migration generation must include:

  ```bash
  cd apps/server && DATABASE_URL=postgresql://localhost:5432/dummy pnpm dlx tsx node_modules/drizzle-kit/bin.cjs generate --config src/drizzle.config.ts
  ```

1. Existing migration SQL files are immutable and must never be edited.
2. Validation before commit is always:

  ```bash
  pnpm format && pnpm lint && pnpm typecheck && pnpm build
  ```

## Path Canonicalization

- Preferred collection import path: `~/lib/db.collections`
- All collections are defined in a single file: `apps/web/src/lib/db.collections.ts`

## Transitional Exceptions

- Some legacy/transitional modules may still use direct tRPC/React Query usage.
- Those exceptions must be explicitly tracked in
  `docs/offline-first-architecture.md` and treated as migration debt.

## Priority Order for Conflicts

1. `.github/instructions/00-setup-and-validation.instructions.md`
2. `AGENTS.md`
3. `.github/copilot-instructions.md`
4. Other instruction/reference docs
