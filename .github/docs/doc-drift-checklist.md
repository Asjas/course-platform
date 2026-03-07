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

- [ ] Component-level data access examples use `~/lib/collections`.
- [ ] No direct component-level `useQuery`, `useMutation`, or direct tRPC usage
      is introduced unless marked as an explicit transitional exception.
- [ ] Transitional exceptions are documented in
      `docs/offline-first-architecture.md`.

## Naming and Patterns

- [ ] tRPC endpoint naming examples follow canonical patterns (`getAll`,
      `getById`, `create`, `update`, `delete`, etc.).
- [ ] Legacy/stale API names are shown only in clearly marked anti-pattern
      examples.

## Markdown and Lint Hygiene

- [ ] No unsupported instruction frontmatter keys are present.
- [ ] No markdown lint blockers (for example, inline HTML where disallowed,
      emphasis-used-as-heading) are introduced.
- [ ] Internal links resolve correctly in repo context.

## Verification

- [ ] Run workspace diagnostics and resolve newly introduced issues.
- [ ] If full command execution is unavailable in the current tool context,
      record that limitation and use diagnostics as the fallback check.
