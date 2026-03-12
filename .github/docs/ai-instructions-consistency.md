# AI Instruction Consistency Map

This file is the reconciliation map for AI-facing documentation across
`AGENTS.md`, `.github/copilot-instructions.md`, and
`.github/instructions/*.instructions.md`.

## Document Roles

| File | Purpose | Audience |
|------|---------|----------|
| `AGENTS.md` | Standalone reference for all AI agents | Claude Code, Codex, Gemini CLI, Cursor |
| `.github/copilot-instructions.md` | Compact project overview + critical rules | GitHub Copilot (loaded on every file) |
| `.github/instructions/*.instructions.md` | Detailed domain-specific patterns | GitHub Copilot (loaded by `applyTo` match) |
| `.github/docs/*.md` | Reference material linked from instructions | All agents (on-demand) |

## Canonical Rules

1. Data access in React components is **collection-first**.
2. Direct component usage of `tRPC`/`useQuery`/`useMutation` is prohibited.
3. Migration generation must include `DATABASE_URL=postgresql://localhost:5432/dummy`.
4. Existing migration SQL files are immutable and must never be edited.
5. Validation before commit: `pnpm format && pnpm lint && pnpm typecheck && pnpm build`.

## Path Canonicalization

- Preferred collection import path: `~/lib/db.collections`
- All collections are defined in: `apps/web/src/lib/db.collections.ts`

## Instruction File Scope Map

| File | `applyTo` |
|------|-----------|
| `a11y.instructions.md` | `**/*.tsx` |
| `commit-message.instructions.md` | `**` |
| `cypress-e2e.instructions.md` | `apps/web/cypress/**` |
| `github-actions.instructions.md` | `.github/workflows/*.yml` |
| `markdown.instructions.md` | `**/*.md` |
| `performance.instructions.md` | `**/*.ts, **/*.tsx` |
| `security.instructions.md` | `**/*.ts, **/*.tsx` |
| `trpc-type-patterns.instructions.md` | Routers/queries/collections |
| `typescript-node.instructions.md` | `apps/server/**` |
| `typescript-react.instructions.md` | `apps/web/**/*.ts,tsx,css` etc. |
| `unit-testing-rtl.instructions.md` | `apps/web/src/**/*.test.*` |

## Transitional Exceptions

- Some legacy/transitional modules may still use direct tRPC/React Query usage.
- Those exceptions must be tracked in `docs/offline-first-architecture.md`.

## Priority Order for Conflicts

1. `.github/copilot-instructions.md` (project-wide critical rules)
2. `AGENTS.md` (comprehensive agent reference)
3. Domain-specific instruction files
4. Reference docs in `.github/docs/`
