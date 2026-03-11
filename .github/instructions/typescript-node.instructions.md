---
applyTo: "apps/server/**"
description: "Coding style guide for Node.js backend with TypeScript, Fastify, tRPC, Drizzle, Better Auth, with Vitest testing"
---

# Project Context

- Backend Stack:
  - Node.js (>=22.16.0) with TypeScript for server-side logic.
  - Fastify 5 for HTTP server and REST routing.
  - tRPC 11 for type-safe client-server API communication.
  - Drizzle ORM for database queries and mutations with PostgreSQL.
  - Better Auth with Argon2 password hashing for authentication.
  - Redis/Dragonfly (ioredis) for caching and session storage.
  - `async-cache-dedupe` + superjson for Redis-backed result caching.
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
- **IDs**: Use ULID (`import { ulid } from "ulid"`), never UUID or `crypto.randomUUID()`.

### Fastify Routes (REST API)
- Define routes in `/src/routes/<feature>/` directories.
- Separate handlers into `/src/routes/<feature>/handlers/` directory.
- Use TypeScript types with `FastifyRequest` and `FastifyReply` generics.
- Register routes using Fastify's plugin pattern with `done()` callback.
- Use `fastify-type-provider-zod` (`validatorCompiler` / `serializerCompiler`) for schema validation.
- **Error handling**: Use `fastify.to(promise)` from `@fastify/sensible` for `[err, result]` tuple
  pattern instead of try/catch in handlers:

```typescript
const [err, result] = await fastify.to(someAsyncOperation());
if (err) {
  return reply.internalServerError(err.message);
}
```

### tRPC Routers (Type-safe API)
- Define routers in `/src/routers/<feature>/` directories.
- Use Zod for input validation.
- Export combined router from `/src/router.ts`.
- Add explicit `Promise<TypeName>` return type to all query/mutation handlers.
- Import type from the queries file: `import { getAllItems, type AllItems } from "./queries.js"`.

### Drizzle Database
- Schemas: Define in `/src/db/schema/<entity>.ts` (flat structure).
- All tables must use `mySchema.table()` from `~/db/my-schema.js`.
- All enums must use `mySchema.enum()` from `~/db/my-schema.js`.
- All tables should spread `...timestamps` from `~/db/schema/columns.helpers.js`.
- Add DB-level constraints using Drizzle's `check(sql\`...\`)` for data integrity.
- Add indexes using `index()` and `uniqueIndex()` for query performance.
- Queries: Place in `/src/db/queries/` directory.
- Mutations: Place in `/src/db/mutations/` directory.
- Use `typeof table.$inferSelect` and `typeof table.$inferInsert` for mutation types.
- Define relations using Drizzle's `relations()` function.
- **CRITICAL: ALL prepared statements MUST be module-scoped (defined at the top level of the
  file), NOT function-scoped. Prepared statements are compiled once and reused.**
- Use the high-level `db.query` API with `.prepare("uniqueName")` at the end of the chain.

```typescript
// ✅ Module-scoped prepared statement (CORRECT)
const preparedGetAll = db.query.items
  .findMany({ with: { user: true } })
  .prepare("getAllItems");

export async function getAllItems() {
  return preparedGetAll.execute();
}

// Export type for tRPC router
export type AllItems = Awaited<ReturnType<typeof getAllItems>>;

// ❌ Function-scoped prepared statement (WRONG — compiled on every call)
export async function getAllItems() {
  return db.query.items.findMany({ with: { user: true } });
}
```

### Cache Layer (async-cache-dedupe)

All hot DB reads must be registered in `src/lib/cache.ts` using `cache.define()`:

```typescript
// src/lib/cache.ts — add a new cached function
cache.define(
  "getMyEntity",
  {
    ttl: ONE_HOUR,
    serialize: (args) => args.entityId,   // cache key
    references(args) {
      return [`entity~id~${args.entityId}`, "entity~all"];
    },
  },
  getMyEntity,  // the actual query function
);
```

After mutations, invalidate affected cache references:

```typescript
// In a tRPC mutation or REST handler
await fastify.cache.invalidateAll(["entity~all", `entity~id~${id}`]);
```

Reference patterns in `lib/cache.ts` and `lib/constants.ts` for TTL values.

### Testing
- Write tests using Vitest in `/tests/` directory.
- Use `.spec.ts` or `.test.ts` extension.
- Mock dependencies using `vi.mock`.
- Server test imports must use `.js` extension for ESM resolution (e.g., `import { schema } from "~/config.js"`).
- Use `vi.useFakeTimers()` for time-dependent tests. Always call `vi.useRealTimers()` in `afterEach`.
- See [library-patterns-reference.md](../docs/library-patterns-reference.md#vitest-4) for full Vitest 4 patterns.

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

- `fastify` + `@fastify/sensible` — HTTP server + `fastify.to()` error handling
- `fastify-type-provider-zod` — Zod schema validation for REST routes
- `drizzle-orm` + `drizzle-kit` — Database ORM and migrations
- `@trpc/server` — Type-safe API
- `better-auth` + `fastify-better-auth` — Authentication
- `ioredis` — Redis client
- `async-cache-dedupe` + `superjson` — Redis-backed result caching
- `nodemailer` — Email sending
- `zod` — Schema validation
- `pino` — Structured logging
- `prom-client` — Prometheus metrics
- `ulid` — ID generation

For verified library patterns, gotchas, and testing best practices, see [docs/library-patterns-reference.md](../docs/library-patterns-reference.md).

## Performance

- Use prepared statements and indexes in Drizzle queries.
- Use Redis/Dragonfly + `async-cache-dedupe` for caching hot query results.
- Use `async-cache-dedupe`'s reference-based invalidation for cache coherency.
- Monitor with Prometheus metrics.
