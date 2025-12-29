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
pnpm format                                      # Auto-fix formatting issues
pnpm lint                                        # ESLint (auto-fix when possible)
pnpm typecheck                                   # TypeScript strict mode
pnpm build                                       # Full Turborepo build
```

These commands ensure code quality and catch errors early. Never commit without running all validation steps.

### Database (Drizzle)
```bash
# Generate migration from schema (use this command in apps/server folder)
cd apps/server && pnpm dlx tsx node_modules/drizzle-kit/bin.cjs generate --config src/drizzle.config.ts

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
- Use TanStack Query for server state
- Use Zod 4 for validation

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
- Use `cy.intercept()` for API mocking

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
- `cypress-e2e.instructions.md` - E2E test patterns
- `a11y.instructions.md` - Accessibility requirements
- `security-and-owasp.instructions.md` - Security practices

These are automatically applied based on file paths.
