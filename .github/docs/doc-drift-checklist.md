# Doc Drift Checklist

Use this checklist before merging changes to agent instructions or architecture
docs.

## Scope

- [ ] Changes are applied consistently across `AGENTS.md`,
      `.github/copilot-instructions.md`, and relevant
      `.github/instructions/*.instructions.md` files.
- [ ] New or changed rules are reflected in
      `.github/docs/ai-instructions-consistency.md`.

## Canonical Commands

- [ ] Migration generation command includes `DATABASE_URL=postgresql://localhost:5432/dummy`.
- [ ] Validation command sequence is unchanged and documented as:
      `pnpm format && pnpm lint && pnpm typecheck && pnpm build`.

## Frontend Data Access

- [ ] Component-level data access examples use `~/lib/db.collections`.
- [ ] No direct component-level `useQuery`, `useMutation`, or direct tRPC usage
      is introduced unless marked as an explicit transitional exception.
- [ ] Transitional exceptions are documented in
      `docs/offline-first-architecture.md`.

## File Structure

- [ ] Instruction file `applyTo` patterns match the scope map in
      `ai-instructions-consistency.md`.
- [ ] No instruction file uses `applyTo: "**"` unless it truly applies to all
      file types (only `copilot-instructions.md` and `commit-message` should).
- [ ] Renamed or removed files are updated in both `AGENTS.md` and
      `copilot-instructions.md` reference tables.

## Naming and Patterns

- [ ] tRPC endpoint naming examples follow canonical patterns (`getAll`,
      `getById`, `create`, `update`, `delete`, etc.).
- [ ] Legacy/stale API names are shown only in clearly marked anti-pattern
      examples.

## Markdown and Lint Hygiene

- [ ] No unsupported instruction frontmatter keys are present.
- [ ] No markdown lint blockers are introduced.
- [ ] Internal links resolve correctly in repo context.
