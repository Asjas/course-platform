---
applyTo: "apps/server/**"
description: "Coding style guide for Node.js backend with TypeScript, Fastify, tRPC, Drizzle, Better Auth, with Vitest testing"
---

# Project Context

- Backend Stack:
  - Node.js (>=22.16.0) with TypeScript for server-side logic.
  - Fastify 5 for HTTP server and REST routing.
  - tRPC for type-safe client-server API communication.
  - Drizzle ORM for database queries and mutations with PostgreSQL.
  - Better Auth with Argon2 password hashing for authentication.
  - Redis/Dragonfly (ioredis) for caching and session storage.
  - prom-client for Prometheus metrics.
  - Vitest for unit and integration testing.
- Database Structure:
  - Schemas defined in `/src/db/schema/` as flat TypeScript files (e.g., `/src/db/schema/user.ts`).
  - Queries in `/src/db/queries/` directory for read operations with prepared statements.
  - Mutations in `/src/db/mutations/` directory for insert/update/delete operations.
  - Custom schema namespace via `/src/db/my-schema.ts`.

## Coding Guidelines

### General Standards
- Prefer ES5 function declarations (e.g., `function handleRequest() {}`) over arrow functions for route handlers.
- Specify parameter types and return types for all functions.
- Use camelCase for variables, functions, and methods.
- Use snake_case for database table and column names.
- Follow ESLint rules defined in `eslint.config.mjs`.
- Prefer `const` over `let` for immutable variables.
- Use double quotes (`"`) for string literals.
- Use `.js` extension for relative file imports (TypeScript compiles to ESM).
- Use path alias `~/` for imports (maps to `src/`).

### Fastify Routes (REST API)
- Define routes in `/src/routes/<feature>/` directories.
- Separate handlers into `/src/routes/<feature>/handlers/` directory.
- Use TypeScript types with `FastifyRequest` and `FastifyReply` generics.
- Register routes using Fastify's plugin pattern with `done()` callback.

### tRPC Routers (Type-safe API)
- Define routers in `/src/routers/<feature>/` directories.
- Use Zod for input validation.
- Export combined router from `/src/router.ts`.

### Drizzle Database
- Schemas: Define in `/src/db/schema/<entity>.ts` (flat structure).
- Queries: Place in `/src/db/queries/` directory.
- Mutations: Place in `/src/db/mutations/` directory.
- Use TypeScript's inferred types (e.g., `typeof user.$inferSelect`).
- Define relations using Drizzle's `relations()` function.
- **CRITICAL: ALL prepared statements MUST be module-scoped (defined at the top level of the file), NOT function-scoped. This is essential for performance as prepared statements are compiled once and reused.**
- Use the high-level `db.query` API with `.prepare("name")` at the end of the query chain.

### Testing
- Write tests using Vitest in `/tests/` directory.
- Use `.spec.ts` or `.test.ts` extension.
- Mock dependencies using `vi.mock`.

## File Organization

- REST Routes: `/src/routes/<feature>/index.ts` with handlers in `/src/routes/<feature>/handlers/`.
- tRPC Routers: `/src/routers/<feature>/index.ts`.
- Queries: `/src/db/queries/<entity>.ts`.
- Mutations: `/src/db/mutations/<entity>.ts`.
- Schemas: `/src/db/schema/<entity>.ts` (flat files, not nested directories).
- Plugins: `/src/plugins/` for Fastify plugins.
- Hooks: `/src/hooks/` for Fastify hooks.
- Libraries: `/src/lib/` for utilities (auth, logging, redis, email).

## Key Libraries

- `fastify` - HTTP server
- `drizzle-orm` + `drizzle-kit` - Database ORM and migrations
- `@trpc/server` - Type-safe API
- `better-auth` + `fastify-better-auth` - Authentication
- `ioredis` - Redis client
- `nodemailer` - Email sending
- `zod` - Schema validation
- `pino` - Logging
- `prom-client` - Prometheus metrics

## Performance

- Use prepared statements and indexes in Drizzle queries.
- Use Redis/Dragonfly for caching hot data.
- Use `async-cache-dedupe` for request deduplication.
- Monitor with Prometheus metrics.
