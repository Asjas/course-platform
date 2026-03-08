---
applyTo: "**"
description: "Comprehensive onboarding guide for coding agents working on the course platform"
---

# Course Platform - Coding Agent Instructions

## Project Overview

Full-stack TypeScript monorepo for a course platform:
- **apps/web**: React 19 + Vite + TanStack (Router, Query, Form) + Tailwind 4
- **apps/server**: Fastify 5 + tRPC + Drizzle ORM + Better Auth
- **packages/shared-ui**: Radix UI component library
- **marketing/learn-fastify**: Astro static site

**Runtime**: PostgreSQL 18, Redis/Dragonfly, Node.js >=22.16.0

---

## Commands Reference

### Initial Setup (First Time Only)
If pnpm is not installed globally, install it:
```bash
npm install -g pnpm@10.26.2
```

Then install dependencies:
```bash
pnpm install --frozen-lockfile  # NEVER use npm or yarn
```

### Package Manager
Always use pnpm with frozen lockfile:
```bash
pnpm install --frozen-lockfile  # NEVER use npm or yarn
```

### Development
```bash
pnpm dev                                         # All apps concurrently
pnpm --filter @apps/web dev                      # Frontend only (port 4173)
pnpm --filter @apps/server dev                   # Backend only (port 5000)
```

**Important**: When creating new routes in `apps/web/src/routes/`, you MUST run the dev server at least once to generate the route types:
```bash
cd apps/web && pnpm run dev
# Wait for server to start (routes will be generated)
# Then stop the server (Ctrl+C)
```

This generates `src/routeTree.gen.ts` which TypeScript needs for route type safety.

### Validation (Run Before Every Commit)
**ALWAYS** run these commands before committing code:
```bash
pnpm format                                      # Auto-fix formatting issues (cached)
pnpm lint                                        # ESLint (auto-fix when possible)
pnpm typecheck                                   # TypeScript strict mode
pnpm build                                       # Full Turborepo build
```

These commands ensure code quality and catch errors early. Never commit without running all validation steps.

**CRITICAL**: Always use `pnpm format` (which includes `--cache --cache-location .cache/prettier`). Never run `prettier --write` directly without cache flags - it bypasses the optimized configuration and is significantly slower.

### Database (Drizzle)
```bash
# Generate migration from schema (use this command in apps/server folder)
cd apps/server && DATABASE_URL=postgresql://localhost:5432/dummy pnpm dlx tsx node_modules/drizzle-kit/bin.cjs generate --config src/drizzle.config.ts

pnpm --filter @apps/server drizzle:migrate       # Apply migrations
pnpm --filter @apps/server drizzle:studio        # Open Drizzle Studio GUI
```

### Testing
```bash
pnpm test                                        # All tests
pnpm --filter @apps/server test                  # Server tests only
pnpm --filter @apps/web test                     # Web tests only
pnpm --filter @apps/web e2e                      # Cypress interactive
pnpm --filter @apps/web e2e:run                  # Cypress headless
```

---

## Architecture

### Directory Structure
```
apps/web/src/
├── routes/           # TanStack Router (file-based)
├── components/       # React components
├── lib/              # Utilities, API clients
└── schema/           # Zod validation schemas

apps/server/src/
├── routes/           # Fastify REST routes
├── routers/          # tRPC routers
├── db/
│   ├── schema/       # Drizzle table definitions
│   ├── queries/      # Read operations
│   └── mutations/    # Write operations
├── lib/              # Auth, logging, redis, email
└── plugins/          # Fastify plugins
```

### File Naming Conventions
- **Routes (web)**: `__root.tsx`, `index.tsx`, `$param.tsx`, `(group)/`, `_layout/`
- **Routes (server)**: `export default function(fastify, opts) {}`
- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Database**: snake_case for tables/columns

---

## Code Style Requirements

### TypeScript
- Strict mode enabled
- No `any` - use `unknown` if unsure
- Define explicit types for function parameters
- Use path alias `~/` for imports (maps to `src/`)
- Use `.js` extension for relative imports in server code

### Formatting (Prettier)
- Double quotes for strings
- Semicolons required
- Imports auto-sorted
- 80 character line width

### React Components
- Functional components with ES5 function declarations
- Use `function MyComponent()` not arrow functions
- **NEVER use tRPC or React Query directly in components** - use collection hooks instead
- Use Zod 4 for validation

### Offline-First Data Fetching (CRITICAL)

This application supports offline mode for web and Tauri native apps. **ALL data operations MUST go through TanStack React-DB collections.**

```typescript
// ❌ NEVER: Direct tRPC/React Query in components
const { data } = trpc.courses.getAll.useQuery(); // BREAKS OFFLINE!

// ✅ ALWAYS: Use collection hooks
import { useCourses } from "~/lib/collections";
const { data } = useCourses(); // Works offline!
```

Collections are in `apps/web/src/lib/collections/`. See `trpc-type-patterns.instructions.md` for full details.

### Fastify Routes
```typescript
export default function myRoutes(fastify, opts) {
  fastify.get("/path", async (req, reply) => {
    // handler
  });
}
```

### Drizzle Queries
- Schemas in `src/db/schema/<entity>.ts`
- Queries (reads) in `src/db/queries/`
- Mutations (writes) in `src/db/mutations/`
- Use `$inferSelect` and `$inferInsert` for types

---

## Testing Expectations

### Unit Tests (Vitest)
- Server: `apps/server/tests/**/*.{spec,test}.ts`
- Web: `apps/web/src/**/*.{spec,test}.{ts,tsx}`
- Mock dependencies with `vi.mock()`

### E2E Tests (Cypress)
- Located in `apps/web/cypress/e2e/`
- Use `data-testid` for stable selectors
- Use `cy.intercept()` for observing/waiting on network calls when needed; do not mock auth/permission outcomes
- Start backend before E2E: `pnpm --filter @apps/server dev`
- Start frontend preview before E2E: `pnpm --filter @apps/web preview`
- Wait until both servers are available before running Cypress
- Run only changed/created spec files during development (never full suite by default)
- Run changed E2E specs immediately after creating/editing them
- CRUD tests must include UI-based cleanup by deleting created entities through the normal product flow
- Do NOT run bare `pnpm preview` from repo root for web E2E setup
- Authorization coverage is mandatory: include owner-vs-non-owner tests (a user must not access another user's content)
- Authorization coverage is mandatory: include admin-vs-non-admin tests (admin can access admin routes/data, regular users cannot)
- Permission-failure UX is mandatory: assert blocked behavior and a visible permission/access popup message from backend errors
- For admin pages blocked by route guards, Cypress should assert route-level denial only; do not force mutation-level UI tests from blocked pages
- Add server-side Vitest tests for protected tRPC endpoints to verify non-admin requests are rejected

Known failure mode (2026-03-07): Bare `pnpm preview` at repository root fails
with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL` and blocks E2E progress. Always use
`pnpm --filter @apps/web preview`.

Known failure mode (2026-03-07): Running Cypress before backend startup causes
`cy.request` failures to `http://localhost:5000/api/auth/sign-up/email`.
Always start backend first and wait for both backend and frontend readiness.

---

## Commit Messages

Follow Conventional Commits:
```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, perf, test, chore
Scope: api, ui, auth, db, etc.
```

---

## Path-Specific Instructions

Specialized guidelines exist in `.github/instructions/`:
- `typescript-react.instructions.md` - React/web patterns
- `typescript-node.instructions.md` - Server/Fastify patterns
- `trpc-type-patterns.instructions.md` - tRPC patterns and offline-first
- `cypress-e2e.instructions.md` - E2E test patterns
- `a11y.instructions.md` - Accessibility requirements
- `security-and-owasp.instructions.md` - Security practices
- `performance-optimization.instructions.md` - Performance best practices

These are automatically applied based on file paths.

Detailed reference documentation lives in `.github/docs/`:
- `a11y-reference.md` - Full accessibility patterns and code examples
- `library-patterns-reference.md` - Zod 4, Vitest 4, Drizzle, and testing gotchas
- `package-catalog.md` - Complete dependency inventory, versions, homepage links, node_modules paths, and usage patterns
- `performance-optimization-reference.md` - Comprehensive performance guide
- `ai-instructions-consistency.md` - Cross-file source of truth and exception map
- `doc-drift-checklist.md` - Pre-merge checklist to prevent instruction drift

For cross-agent guidance (Claude Code, Cursor, Codex, Gemini CLI), see the `AGENTS.md` file in the repository root.
