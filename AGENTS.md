# Course Platform - Agent Guidance

This file provides guidance to AI coding agents (Claude Code, Cursor AI, Codex,
Gemini CLI, GitHub Copilot, and other AI coding assistants) when working with
code in this repository.

## What this repository is

This is a **full-stack TypeScript monorepo** for a course platform built with
modern tooling:

- **apps/web**: React 19 + Vite 7 + TanStack (Router, Query, Form) + Tailwind
  CSS 4
- **apps/server**: Fastify 5 + tRPC + Drizzle ORM + Better Auth
- **packages/shared-ui**: Radix UI component library
- **marketing/learn-fastify**: Astro static site

**Runtime requirements**: PostgreSQL 18, Redis/Dragonfly, Node.js >=22.16.0,
pnpm 10

## High-level architecture

### 1) Frontend (`apps/web/`)

Single-page application with file-based routing and offline-first data layer.

```
apps/web/src/
├── routes/           # TanStack Router (file-based)
├── components/       # React components (PascalCase)
├── lib/              # Utilities, API clients, collections
├── hooks/            # Custom React hooks
├── schema/           # Zod validation schemas
└── styles/           # Tailwind CSS styles
```

Key patterns:

- **Offline-first**: ALL data fetching goes through TanStack React-DB
  collections (`~/lib/collections/`), never direct tRPC/React Query in
  components.
- **File-based routing**: TanStack Router with `__root.tsx`, `index.tsx`,
  `$param.tsx`, `(group)/`, `_layout/` conventions.
- **Functional components**: ES5 function declarations (`function MyComponent()`
  not arrows).
- **No `.js`/`.ts` extensions** in imports (Vite handles resolution).

### 2) Backend (`apps/server/`)

REST + tRPC API server with PostgreSQL database.

```
apps/server/src/
├── routes/           # Fastify REST routes
├── routers/          # tRPC routers
├── db/
│   ├── schema/       # Drizzle table definitions (flat files)
│   ├── queries/      # Read operations (prepared statements)
│   └── mutations/    # Write operations
├── lib/              # Auth, logging, redis, email
├── plugins/          # Fastify plugins
└── hooks/            # Fastify hooks
```

Key patterns:

- **Drizzle ORM**: Schemas in `db/schema/`, queries in `db/queries/`, mutations
  in `db/mutations/`.
- **Prepared statements**: MUST be module-scoped (top-level), never
  function-scoped.
- **`.js` extension** required for relative imports (ESM output).
- **Path alias**: `~/` maps to `src/`.

### 3) Shared UI (`packages/shared-ui/`)

Radix UI component library shared across apps.

### 4) Marketing (`marketing/learn-fastify/`)

Astro static site for the learn-fastify course marketing page.

## Common commands

Run from repository root. **Always use pnpm** (never npm or yarn).

```bash
# Setup
npm install -g pnpm@10.26.2        # Install pnpm (if not available)
pnpm install --frozen-lockfile      # Install dependencies

# Development
pnpm dev                            # All apps concurrently
pnpm --filter @apps/web dev         # Frontend only (port 4173)
pnpm --filter @apps/server dev      # Backend only (port 5000)

# Validation (REQUIRED before every commit)
pnpm format                         # Auto-fix formatting (Prettier)
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
cd apps/server && DATABASE_URL=postgresql://localhost:5432/dummy pnpm dlx tsx node_modules/drizzle-kit/bin.cjs generate --config src/drizzle.config.ts
pnpm --filter @apps/server drizzle:migrate
pnpm --filter @apps/server drizzle:studio
```

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

## Editing rules

1. **NEVER edit migration files** (`.sql` files in `drizzle/` directories).
   Create new migrations instead.
2. **NEVER use tRPC or React Query directly in React components** — use
   collection hooks from `~/lib/collections/`.
3. **ALWAYS run validation**
   (`pnpm format && pnpm lint && pnpm typecheck && pnpm build`) before
   committing.
4. **ALWAYS use pnpm** with `--frozen-lockfile` for installs.
5. When creating new routes in `apps/web/src/routes/`, run the dev server once
   to generate route types.

## Detailed guidance

For deeper, context-specific guidance, see the instruction files in
`.github/instructions/`:

| File                                                  | Scope                         | Description                       |
| ----------------------------------------------------- | ----------------------------- | --------------------------------- |
| `00-setup-and-validation.instructions.md`             | All files                     | Setup and validation steps        |
| `a11y.instructions.md`                                | All files                     | Accessibility (WCAG 2.2 AA)       |
| `commit-message.instructions.md`                      | All files                     | Conventional Commits format       |
| `cypress-e2e.instructions.md`                         | `apps/web/cypress/**`         | E2E testing with Cypress          |
| `github-actions-ci-cd-best-practices.instructions.md` | `.github/workflows/*.yml`     | CI/CD pipeline patterns           |
| `markdown.instructions.md`                            | `**/*.md`                     | Documentation standards           |
| `performance-optimization.instructions.md`            | All files                     | Performance best practices        |
| `security-and-owasp.instructions.md`                  | All files                     | OWASP security guidelines         |
| `trpc-type-patterns.instructions.md`                  | Routers/queries/collections   | tRPC patterns and offline-first   |
| `typescript-node.instructions.md`                     | `apps/server/**`              | Fastify + Drizzle + tRPC patterns |
| `typescript-react.instructions.md`                    | `**/*.ts, **/*.tsx, **/*.css` | React + TanStack patterns         |

Reference documentation for detailed best practices is in `.github/docs/`.
