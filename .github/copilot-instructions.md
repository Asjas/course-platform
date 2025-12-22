---
applyTo: "**"
description: "Comprehensive onboarding guide for coding agents working on the course platform"
---

# Course Platform - Coding Agent Onboarding

## Project Overview
Full-stack monorepo: course platform with web app (React 19), API server (Fastify), native desktop app (Tauri), marketing site (Astro). PostgreSQL database, Redis cache, Better Auth, Drizzle ORM, TanStack stack.

## Critical Setup (Required Order)

### 1. Install Dependencies
```bash
pnpm install --frozen-lockfile  # ALWAYS use --frozen-lockfile, NEVER npm/yarn
```

### 2. Environment Setup
```bash
cp apps/server/.env.sample apps/server/.env
cp apps/web/.env.sample apps/web/.env
# Edit .env files - server needs DATABASE_URL, REDIS_HOST, BETTER_AUTH_SECRET (32+ chars), PEPPER_SECRET (32+ chars)
# web needs VITE_BETTER_AUTH_URL, VITE_TRPC_URL
```

### 3. Start Services
```bash
docker-compose up -d  # Starts PostgreSQL + Redis/Dragonfly
pnpm run --filter "./apps/server" drizzle:migrate  # Run DB migrations
```

## Development Commands

```bash
pnpm run dev                                    # All apps
pnpm run --filter "./apps/web" dev              # Frontend (port 4173)
pnpm run --filter "./apps/server" dev           # Backend (port 5000)
pnpm run --filter "./apps/server" drizzle:studio # DB GUI
```

## Pre-Commit Validation (Must Pass)

**Husky runs these automatically. Run manually before PR:**
```bash
pnpm run check-format  # Prettier check
pnpm run lint          # ESLint (flat config in eslint.config.mjs)
pnpm run typecheck     # TypeScript strict mode
pnpm run build         # Turborepo build (outputs: dist/, build/, .astro/)
pnpm run test          # Vitest all packages
```

## CI/CD Replication

**GitHub Actions workflow** (`.github/workflows/ci.yml`) tests on Node.js 20-24:
```bash
pnpm install --frozen-lockfile
pnpm run check-format && pnpm run lint && pnpm run typecheck
pnpm run build  # Uses Turborepo remote cache
pnpm run --filter @apps/server test
# E2E: cypress install (first time), then build web, preview, run cypress
```

## Architecture & File Locations

### Monorepo Structure
```
apps/web/               # React frontend (Vite + TanStack Router)
  src/routes/          # File-based routing (__root.tsx, index.tsx, $param.tsx)
  src/components/      # React components
  vite.config.ts       # MDX, Lightning CSS, Tailwind 4, TanStack Router plugin
  vitest.config.ts     # jsdom, tests in src/**/*.{spec,test}.{ts,tsx}
apps/server/           # Fastify backend
  src/routes/          # REST API routes (export default function(fastify, opts))
  src/routers/         # tRPC routers for type-safe API
  src/db/schema/       # Drizzle schemas (snake_case tables)
  src/db/queries/      # Read operations (prepared queries)
  src/db/mutations/    # Write operations (insert/update/delete)
  src/lib/             # Utilities (auth, logging, redis, email)
  src/drizzle.config.ts
  drizzle/             # Generated migrations
  vitest.config.ts     # node env, tests in tests/**/*.{spec,test}.ts
packages/shared-ui/    # Radix UI components
marketing/learn-fastify/ # Astro static site
```

### Key Config Files
- **pnpm-workspace.yaml**: Workspace definition (apps/**, marketing/**, packages/**)
- **turbo.json**: Build cache config (remote enabled: https://turborepo.codewizard.training)
- **apps/*/tsconfig.json**: Strict mode, path alias ~/* → src/*
- **.prettierrc**: Import sorting, double quotes, semicolons required
- **eslint.config.mjs**: Flat config, separate rules for web (React), server (Node), marketing (Astro)

## Common Patterns

### Routing
**Frontend**: TanStack Router file-based
- `apps/web/src/routes/__root.tsx` = root layout
- `apps/web/src/routes/index.tsx` = /
- `apps/web/src/routes/verify-email.$token.tsx` = /verify-email/:token
- `(auth)/` = route group (layout)
- `_authenticated/` = protected layout

**Backend**: Fastify routes in `apps/server/src/routes/`
```typescript
export default function featureRoutes(fastify, opts) {
  fastify.get('/path', async (req, reply) => { ... });
}
```

### Database
```bash
# Workflow: Edit schema → generate → migrate
pnpm run --filter "./apps/server" drizzle:generate
pnpm run --filter "./apps/server" drizzle:migrate
```

### Testing
**Unit/Integration** (Vitest): `pnpm run test` or `pnpm run --filter <pkg> test`
**E2E** (Cypress): Install browsers first `pnpx cypress install`, then:
```bash
pnpm run --filter @apps/web build
pnpm run --filter @apps/web preview  # Terminal 1
pnpm run --filter @apps/web e2e:run  # Terminal 2
```

## Known Issues & Solutions

**Issue**: Native deps fail build
**Fix**: Already handled in Dockerfile (python3, make, g++, postgresql-dev)

**Issue**: Workspace install order errors
**Fix**: Always use `pnpm install --frozen-lockfile`

**Issue**: Tests fail without .env
**Fix**: Copy .env.sample files and configure before testing

**Issue**: Cypress browser not found
**Fix**: Run `pnpx cypress install` once

## Code Quality Standards

- **TypeScript**: Strict mode, no implicit any, unused vars/params not allowed
- **Imports**: Auto-sorted by Prettier, unused auto-removed by ESLint
- **Style**: Semicolons required, double quotes, 80 char line width
- **Commits**: Conventional commits enforced (feat, fix, docs, style, refactor, test, chore)
- **Pre-commit**: Husky runs format check + lint (see `.husky/pre-commit`)

## Dependencies

**Package Manager**: pnpm 10.26.1 (in package.json packageManager field)
**Node.js**: Server requires >=22.16.0, CI tests 20.x-24.x
**Runtime**: PostgreSQL 18, Redis/Dragonfly
**Build-only deps**: Listed in pnpm-workspace.yaml onlyBuiltDependencies (argon2, esbuild, sharp, etc.)

## Trust These Instructions

Information validated from codebase analysis. Only search further if encountering undocumented errors or needing specific implementation details. Review `.github/instructions/` for specialized guidelines (a11y, security, performance, testing).
