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
- **Internal entity IDs** (DB primary keys and other app-generated internal IDs): Use ULID (`import { ulid } from "ulid"`); do not use UUID or `crypto.randomUUID()` for these.
- **Allowed exceptions**: UUIDs and `crypto.randomUUID()` may be used for external identifiers and non-entity values where appropriate (for example, `LEARN_FASTIFY_POLAR_PRODUCT_ID` or upload filenames), as long as they are not used as internal primary keys.

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

- **Custom typed errors**: Use `@fastify/error` to create typed HTTP errors with codes (install
  `@fastify/error` if not already in `package.json`):

```typescript
import createError from "@fastify/error";

const NotFoundError = createError("NOT_FOUND", "%s not found", 404);
const ConflictError = createError("CONFLICT", "%s already exists", 409);

// Usage in a handler
throw new NotFoundError("Course");
throw new ConflictError("Email");
```

For most cases, the `@fastify/sensible` reply helpers already installed (`reply.notFound()`,
`reply.badRequest()`, `reply.internalServerError()`) are sufficient and don't require a
separate package.

- **Always define response schemas** for serialization performance — Fastify uses
  `fast-json-stringify` when a response schema is present, which is significantly faster than
  `JSON.stringify`. Use `fastify-type-provider-zod` schemas:

```typescript
app.get("/courses", {
  schema: {
    response: {
      200: z.array(courseSchema),
    },
  },
  handler: async () => getAllCourses(),
});
```

### Fastify Plugins and Encapsulation

Fastify plugins are **encapsulated by default** — decorators, hooks, and sub-plugins registered
inside a plugin are **not visible** to sibling or parent scopes.

**This project's approach** uses `@fastify/autoload` with `encapsulate: false` so all plugins
in `plugins/external/` and `plugins/app/` share the same scope and their decorators are
available to all routes:

```typescript
// server.ts — plugins loaded without encapsulation
await server.register(fastifyAutoload, {
  dir: join(import.meta.dirname, "plugins", "app"),
  encapsulate: false, // makes fastify.db, fastify.cache etc. visible globally
});
```

**Alternative** — for individual plugins outside the autoloaded directories, use
[`fastify-plugin`](https://github.com/fastify/fastify-plugin) (`fp`) to promote decorators
to the parent scope:

```typescript
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

// Without fp: decorator only visible inside this plugin (scoped)
// With fp: decorator promoted to parent scope (shared)
const dbPlugin: FastifyPluginAsync = fp(async function (fastify) {
  const db = await createConnection();
  fastify.decorate("db", db);

  fastify.addHook("onClose", async () => {
    await db.end(); // use the closed-over `db`, not fastify.db
  });
});

export default dbPlugin;
```

Use encapsulation **intentionally** for route groups that need isolated hooks (e.g. admin-only
auth) — register those as plain plugins **without** `fp` or `encapsulate: false`.

### TypeScript Declaration Merging for Fastify Decorators

When a plugin decorates the Fastify instance (e.g. `fastify.db`, `fastify.cache`,
`fastify.config`), extend the Fastify type interfaces via declaration merging so callers get
full type inference.

**In this project**, the declarations live in `apps/server/types/fastify.d.ts` (referenced by
`tsconfig.json`'s `typeRoots`). Add new decorator types here:

```typescript
// apps/server/types/fastify.d.ts
import type { Config } from "~/config.js";
import type { db } from "~/db/index.js";
import type { cache } from "~/lib/cache.js";
import type { mailer } from "~/lib/mailer.js";
import type { User } from "~/db/schema/user.js";

declare module "fastify" {
  interface FastifyInstance {
    config: Config;
    cache: typeof cache;
    db: typeof db;
    mailer: typeof mailer;
  }

  interface FastifyRequest {
    user: Pick<User, "id" | "email" | "role" | "banned" | ...> | null;
    startTime: bigint;
    normalizedRoute: string;
  }
}
```

This makes `fastify.db`, `fastify.cache`, and `request.user` fully typed throughout the server
without manual casts.

**Note**: `fastify.config` is decorated directly in `server.ts` (not via a plugin), using
`server.decorate("config", config)` before any plugins are registered.

### Fastify Request Lifecycle and Hooks

Hooks execute in this order per request:

```
onRequest → preParsing → preValidation → preHandler → Handler
  → preSerialization → onSend → onResponse
```

**Hook selection guide:**

| Hook | Use for |
|------|---------|
| `onRequest` | Authentication checks, request ID setup, early rejection (body not yet parsed) |
| `preValidation` | Normalize/transform body before Zod validation (e.g. lowercase email) |
| `preHandler` | Authorization, load related resources, transaction setup |
| `preSerialization` | Add metadata to every response, strip sensitive fields |
| `onSend` | Modify serialized payload, add response timing headers |
| `onResponse` | Log response metrics, cleanup — cannot modify response |
| `onError` | Cleanup resources (temp files, transactions) on error |
| `onClose` | Disconnect external resources when server shuts down |

**Hook and plugin `async` rule — only use `async` if `await` is needed.** `async` wraps the
return value in a Promise, which allocates an extra object on every call. For synchronous work
(setting a header, incrementing a counter), use the callback (`done`) style instead:

```typescript
// ✅ callback style — no async allocation, correct for synchronous work
fastify.addHook("onRequest", function metricsHook(request, _reply, done) {
  request.startTime = process.hrtime.bigint();
  done();
});

// ✅ async style — only when await is actually used
fastify.addHook("onRequest", async function authHook(request, reply) {
  const session = await auth.api.getSession({ headers: request.headers });
  request.user = session?.user ?? null;
});

// ❌ unnecessary async — no await, wastes a Promise allocation on every request
fastify.addHook("onRequest", async (request, _reply) => {
  request.startTime = process.hrtime.bigint();
});
```

The same rule applies to **plugins** and **route handlers**:

```typescript
// ✅ callback plugin — no await needed, no extra Promise
export default function timingPlugin(fastify, _opts, done) {
  fastify.addHook("onSend", function (_request, reply, _payload, done) {
    reply.header("Timing-Allow-Origin", fastify.config.ORIGIN);
    done();
  });
  done();
}

// ✅ async plugin — only when await is needed for setup
export default async function dbPlugin(fastify) {
  const db = await createConnection();
  fastify.decorate("db", db);
}
```

**Important**: Never declare a hook or plugin `async` and also call `done()` — pick one style
per function. Mixing them (returning a resolved Promise AND calling `done`) triggers Fastify's
"reply already sent" guard.

Scoped hooks only apply to routes registered **within the same plugin scope**. Use this to
apply an admin-only auth check to a subtree of routes:

```typescript
fastify.register(async function adminRoutes(fastify) {
  fastify.addHook("preHandler", isAdmin); // only runs for routes in this plugin
  fastify.get("/admin/users", handler);
});
```

### Graceful Shutdown

This server uses [`close-with-grace`](https://github.com/fastify/close-with-grace) for
graceful shutdown. The shutdown sequence in `index.ts` follows this order:

1. `closeWithGrace` receives `SIGTERM`/`SIGINT` signal
2. External connections (`polarPool`, `pool`) close first
3. Fastify server (`app.close()`) closes last — this drains in-flight requests

**Important**: Do NOT call `closeWithGrace()` again inside `process.on('uncaughtException')`.
Re-calling it re-registers signal handlers and causes the DB pool to end immediately, crashing
any remaining in-flight requests. The `uncaughtException` handler should only log:

```typescript
process.on("uncaughtException", (err) => {
  app.log.error({ err }, "Uncaught Exception occurred");
  // Do NOT call closeWithGrace() here
});
```

Register per-plugin cleanup in `onClose` hooks rather than in the top-level shutdown handler:

```typescript
fastify.addHook("onClose", async (fastify) => {
  await fastify.db.$client.end();
});
```

### Pino Structured Logging

Use **structured logging** (object first, message second) throughout. Avoid string
concatenation or passing only an error with no message:

```typescript
// ✅ Structured — searchable and parseable
request.log.info({ userId: user.id, action: "course_enrolled" }, "User enrolled in course");
request.log.error({ err, courseId }, "Failed to enroll user");

// ❌ Error only, no message — hard to query in log aggregators
fastify.log.error(err);

// ❌ Unstructured — hard to parse or search
request.log.info(`User ${user.id} enrolled in course ${courseId}`);
```

Use **`request.log`** (not `fastify.log`) inside route handlers — it includes the request ID
automatically and correlates logs across the full request lifecycle. Use
**`request.log.child({})`** to add extra context:

```typescript
// REST handler — use request.log
const log = request.log.child({ handler: "createCourse", courseId });
log.info("Starting course creation");
```

**In tRPC routers**, access the request logger via the context:

```typescript
// tRPC handler — use ctx.request.log
getAll: publicProcedure.query(async ({ ctx }): Promise<AllCourses> => {
  const [err, courses] = await ctx.reply.server.to(
    ctx.reply.server.cache.getAllCourses(),
  );
  if (err) {
    ctx.request.log.error({ err }, "Failed to fetch courses");
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
  return courses;
}),
```

Use `fastify.log` (not `request.log`) only in plugin-level code and hooks where no per-request
context exists (e.g. `onClose`, plugin initialization, `metricsPlugin`).

**Redact sensitive fields** in the Pino logger config to prevent them from appearing in logs.
In this project, the Pino instance is created in `src/lib/logging.ts` — add redactions there:

```typescript
const logger = pino({
  level: "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.secret",
    ],
    censor: "[REDACTED]",
  },
});
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

### Async Patterns

Prefer `async/await` over Promise chains. For **concurrent but independent** operations, always
use `Promise.all`:

```typescript
// ✅ Parallel — both queries run concurrently
const [courses, users] = await Promise.all([getAllCourses(), getAllUsers()]);

// ❌ Sequential — unnecessary latency
const courses = await getAllCourses();
const users = await getAllUsers();
```

When **some failures are acceptable** (e.g. enriching a list from multiple sources), use
`Promise.allSettled`:

```typescript
const results = await Promise.allSettled(items.map((item) => enrichItem(item)));
const enriched = results
  .filter((r) => r.status === "fulfilled")
  .map((r) => r.value);
```

**Limit concurrency** for bulk operations that could exhaust DB connections or memory. Use
[`p-limit`](https://github.com/sindresorhus/p-limit) (already in `apps/server/package.json`):

```typescript
import pLimit from "p-limit";

const limit = pLimit(5); // max 5 concurrent DB calls

const results = await Promise.all(
  ids.map((id) => limit(() => db.query.items.findFirst({ where: eq(items.id, id) }))),
);
```

### Environment Configuration

**Avoid using `NODE_ENV` to toggle application behaviour.** `NODE_ENV` conflates multiple
concerns (logging verbosity, security settings, infrastructure choices) into one variable.
Use **explicit environment variables** for each concern instead:

```typescript
// ❌ Antipattern — NODE_ENV conflates concerns
if (process.env.NODE_ENV === "development") {
  disableRateLimiting();
  enableVerboseLogging();
}

// ✅ Explicit variables per concern
const rateLimitEnabled = process.env.RATE_LIMIT_ENABLED !== "false";
const logLevel = process.env.LOG_LEVEL ?? "info";
```

**Exception**: `NODE_ENV` is legitimately used when third-party libraries require it to select
their own environment mode. In this project, `config.NODE_ENV` is used to switch the Polar
payment API between `production` and `sandbox` servers, and to control Better Auth's email
verification behaviour — these cannot be replaced with custom env vars.

## File Organization

- REST Routes: `/src/routes/<feature>/index.ts` with handlers in `/src/routes/<feature>/handlers/`.
- tRPC Routers: `/src/routers/<feature>/index.ts`.
- Queries: `/src/db/queries/<entity>.ts`.
- Mutations: `/src/db/mutations/<entity>.ts`.
- Schemas: `/src/db/schema/<entity>.ts` (flat files, not nested directories).
- Plugins: `/src/plugins/` for Fastify plugins.
- Hooks: `/src/hooks/` for Fastify hooks.
- Libraries: `/src/lib/` for utilities (auth, logging, redis, email).
- **TypeScript type augmentations**: `/types/fastify.d.ts` — `declare module "fastify"` for `FastifyInstance` and `FastifyRequest` extensions.

## Key Libraries

- `fastify` + `@fastify/sensible` — HTTP server + `fastify.to()` error handling + reply helpers
- `@fastify/autoload` — auto-registers plugins from directories; use `encapsulate: false` to share decorators globally
- `fastify-plugin` (`fp`) — alternative to `encapsulate: false` for individual plugins that need to promote decorators to parent scope
- `@fastify/error` — typed custom HTTP error factory (`createError(code, message, statusCode)`); install if needed
- `fastify-type-provider-zod` — Zod schema validation for REST routes
- `drizzle-orm` + `drizzle-kit` — Database ORM and migrations
- `@trpc/server` — Type-safe API
- `better-auth` + `fastify-better-auth` — Authentication
- `ioredis` — Redis client
- `async-cache-dedupe` + `superjson` — Redis-backed result caching
- `close-with-grace` — graceful shutdown (SIGTERM/SIGINT + uncaughtException handling)
- `@dotenvx/dotenvx` — environment file loading (`.env`); called at the top of `config.ts`
- `nodemailer` — Email sending
- `zod` — Schema validation
- `pino` — Structured logging
- `prom-client` — Prometheus metrics
- `p-limit` — Concurrency limiting for bulk async operations (`apps/server`)
- `ulid` — ID generation

For verified library patterns, gotchas, and testing best practices, see [docs/library-patterns-reference.md](../docs/library-patterns-reference.md).

## Performance

- Use prepared statements and indexes in Drizzle queries.
- Use Redis/Dragonfly + `async-cache-dedupe` for caching hot query results.
- Use `async-cache-dedupe`'s reference-based invalidation for cache coherency.
- **Always define response schemas** on Fastify routes — Fastify uses `fast-json-stringify` when
  a response schema is present (much faster than `JSON.stringify`). The project uses
  `fastify-type-provider-zod` schemas for this.
- **`@fastify/under-pressure`** is configured via `fastify-healthcheck` in
  `src/plugins/external/healthcheck.ts`. Tune `maxEventLoopDelay`, `maxHeapUsedBytes`,
  and `maxRssBytes` in the `underPressureOptions` there to shed load before the event loop
  falls behind (returns 503 when thresholds are exceeded).
- Use `p-limit` to cap concurrency for bulk async operations (e.g., batch-enriching rows from
  the DB) to prevent pool exhaustion.
- Monitor with Prometheus metrics.
