# Library Patterns Reference

> Verified patterns, gotchas, and best practices for the libraries used in this
> project. Updated from official documentation and GitHub issues.
>
> Referenced by instruction files in `.github/instructions/`.

---

## Zod 4

**Version**: 4.x (breaking changes from Zod 3)

### Key Changes from Zod 3

- **Standalone format types**: `z.email()`, `z.url()`, `z.uuid()`, `z.iso.date()`
  are now standalone types, not string methods. `z.string().email()` still works
  but is deprecated.
- **`.trim()` is NOT available on standalone types** like `z.email()`. It only
  exists on `z.string()`.
- **Checks API**: Use `.check()` to compose validations.
  `z.string().trim().check(z.email())` applies trim before email validation.

### Trim + Email Pattern (CRITICAL)

In Zod 4, `z.email()` does not have `.trim()`, and `z.string().email()` is
deprecated. To trim before validating email, use the `.check()` pattern
recommended by the Zod maintainer
([#4642](https://github.com/colinhacks/zod/issues/4642)):

```typescript
// ❌ BAD: .trim() does not exist on z.email()
z.email().trim();

// ❌ BAD: Deprecated in Zod 4
z.string().email().trim();

// ❌ BAD: Trim runs AFTER email validation, so " user@example.com " fails
z.string().email().trim();

// ✅ GOOD: Recommended by @colinhacks — trim first, then validate email
z.string().trim().check(z.email());

// ✅ ALSO GOOD: Alternative pipe approach
z.string().trim().pipe(z.email());

// ✅ ALSO GOOD: Fully compositional with z.check()
z.string().check(z.trim(), z.email());
```

**Reference**: [colinhacks/zod#4642](https://github.com/colinhacks/zod/issues/4642)

### Trim + URL Pattern

Same issue applies to `z.url()`. The `URL` constructor internally trims
whitespace, but Zod returns the original untrimmed string
([#4754](https://github.com/colinhacks/zod/issues/4754)):

```typescript
// ❌ BAD: " https://a.com" passes validation but returns with leading space
z.url().parse(" https://a.com"); // => " https://a.com"

// ✅ GOOD: Trim first, then validate
z.string().trim().check(z.url());
```

**Reference**: [colinhacks/zod#4754](https://github.com/colinhacks/zod/issues/4754)

### Schema Testing with `.safeParse()`

Use `.safeParse()` for testing schemas without throwing. This lets you assert on
`result.success` and `result.data` / `result.error`:

```typescript
const result = schema.safeParse(input);
expect(result.success).toBe(true);
if (result.success) {
  expect(result.data.field).toBe("value");
}
```

### Omitting Fields in Tests

Use an `omit()` helper instead of `delete` to avoid
`@typescript-eslint/no-dynamic-delete`:

```typescript
function omit<T extends Record<string, unknown>>(
  obj: T,
  key: string,
): Omit<T, typeof key> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => k !== key),
  ) as Omit<T, typeof key>;
}

// ✅ GOOD: No dynamic delete
const result = schema.safeParse(omit(validConfig(), "FIELD_NAME"));

// ❌ BAD: Triggers @typescript-eslint/no-dynamic-delete
delete (config as Record<string, unknown>)[field];
```

### Transform Order Matters

In Zod 4, transforms and validations run in the order they are chained. Place
transforms (`.trim()`, `.toLowerCase()`) **before** validators (`.email()`,
`.min()`) to ensure the transformed value is what gets validated:

```typescript
// Trim, then check minimum length — "  ab  " becomes "ab" (length 2, passes)
z.string().trim().min(2);

// Check minimum length, then trim — "  ab  " is length 6 (passes min), output is "ab"
z.string().min(2).trim();
```

---

## Vitest 4

**Version**: 4.x

### Key Changes from Vitest 1.x/2.x

- **Unawaited async assertions fail tests**: In Vitest 4, if you write an async
  assertion but don't `await` it, the test will fail. Always `await` async
  expectations.

### Test File Patterns

- Server tests: `apps/server/src/**/*.test.ts`
- Web unit tests: `apps/web/src/**/*.test.{ts,tsx}`

### Mocking

```typescript
import { describe, expect, test, vi, beforeEach } from "vitest";

// Mock a module
vi.mock("~/lib/some-module.js", () => ({
  someFunction: vi.fn(),
}));

// Access mocked function
import { someFunction } from "~/lib/some-module.js";
vi.mocked(someFunction).mockReturnValue("mocked-value");

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Parameterized Tests

Use `test.each` for data-driven tests:

```typescript
test.each(["value1", "value2", "value3"])("accepts '%s'", (value) => {
  const result = schema.safeParse({ field: value });
  expect(result.success).toBe(true);
});
```

### Fake Timers

Use `vi.useFakeTimers()` when testing time-dependent code:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Testing Server Code: Import Extensions

Server code uses `.js` extensions for ESM imports. Test files must match:

```typescript
// ✅ GOOD: .js extension in server test imports
import { schema } from "~/config.js";
import { getEntityStreamKey } from "~/lib/sse-sync.js";

// ❌ BAD: Missing .js extension (will fail to resolve)
import { schema } from "~/config";
```

### Config Pattern: Include Paths

Ensure `vitest.config.ts` includes the right glob patterns:

```typescript
// Server: apps/server/vitest.config.ts
test: {
  include: ["src/**/*.test.ts"],  // Covers all subdirectories
}

// Web: apps/web/vitest.config.ts
test: {
  include: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.spec.ts", "src/**/*.spec.tsx"],
}
```

---

## React Testing Library

**Version**: @testing-library/react 16.x

### Setup Pattern

```typescript
// In test-setup.ts (loaded via vitest.config.ts setupFiles)
import "@testing-library/jest-dom/vitest";
```

### Component Testing

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("button click", async () => {
  const user = userEvent.setup(); // MUST be called before render
  render(<MyComponent />);

  await user.click(screen.getByRole("button", { name: /submit/i }));
  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

### Key Rules

- **Call `userEvent.setup()` before `render()`** — this initializes the event
  system.
- **Use `screen` queries** — prefer `screen.getByRole()`, `screen.getByText()`
  over destructured queries.
- **Use accessible queries** — `getByRole`, `getByLabelText` over
  `getByTestId`.

---

## ESLint TypeScript Rules

### `@typescript-eslint/no-dynamic-delete`

Dynamic `delete` on computed property keys is disallowed. Use object spread,
destructuring, or filter-based approaches:

```typescript
// ❌ BAD: Dynamic delete
delete (obj as Record<string, unknown>)[key];

// ✅ GOOD: Omit helper (see Zod section above)
const result = omit(obj, key);

// ✅ GOOD: Destructure to remove known key
const { keyToRemove, ...rest } = obj;
```

---

## Drizzle ORM

### Prepared Statements: Module-Scoped

Prepared statements MUST be defined at module scope (top-level), not inside
functions. This ensures they are compiled once and reused:

```typescript
// ✅ GOOD: Module-scoped prepared statement
const getUserById = db.query.user
  .findFirst({
    where: (user, { eq }) => eq(user.id, sql.placeholder("id")),
  })
  .prepare("getUserById");

export async function getUser(id: string) {
  return getUserById.execute({ id });
}

// ❌ BAD: Function-scoped (recompiles on every call)
export async function getUser(id: string) {
  const query = db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  }).prepare("getUserById");
  return query.execute();
}
```

### Schema Exports

Export `$inferSelect` and `$inferInsert` types from schema files for use in
queries and mutations:

```typescript
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";

export const user = mySchema.table("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
```

---

## General Testing Patterns

### Exporting for Testability

Private utility functions that are pure (no side effects, no closure
dependencies) can be exported for testing. When doing so:

1. Only export functions that won't break existing functionality
2. Prefer extracting to module scope over exporting component-internal functions
3. If a function uses closure variables (like component props), refactor to
   accept those as parameters before exporting

```typescript
// ✅ GOOD: Pure function extracted to module scope and exported
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ✅ GOOD: Closure dependency moved to a parameter
export function hasUserReacted(
  reaction: Reaction,
  currentUserId: string | undefined,
): boolean {
  return reaction.users.some((user) => user.userId === currentUserId);
}

// ❌ BAD: Exporting function that relies on component closure
export function hasUserReacted(reaction: Reaction): boolean {
  return reaction.users.some((user) => user.userId === currentUserId); // Where does currentUserId come from?
}
```

### Test Organization

- Place test files near the code they test:
  - `src/lib/tests/` for server library tests
  - `src/hooks/tests/` for server hook tests
  - `src/schema/__tests__/` for schema validation tests
  - `src/lib/__tests__/` for web library utility tests
  - `src/components/__tests__/` for component utility tests
  - `src/lib/collections/__tests__/` for collection utility tests

---

## async-cache-dedupe (Server Cache Layer)

**Version**: 2.x (used in `apps/server/src/lib/cache.ts`)

All hot DB reads are registered in the cache with `cache.define()`. The cache
uses Redis as a backing store and superjson for serialization.

### Registering a Cached Function

```typescript
// src/lib/cache.ts
import { createCache } from "async-cache-dedupe";
import { redis } from "~/lib/redis.js";
import { ONE_HOUR } from "~/lib/constants.js";

const cache = createCache({
  storage: { type: "redis", options: { client: redis, invalidation: true } },
});

// Register a cached function with TTL and reference keys
cache.define(
  "getMyEntity",                             // Function name (unique)
  {
    ttl: ONE_HOUR,                           // Seconds to cache
    serialize: (args) => args.entityId,      // Cache key derivation
    references(args) {
      // These keys are used for bulk invalidation
      return [`entity~id~${args.entityId}`, "entity~all"];
    },
  },
  getMyEntity,                               // The actual query function
);

export { cache };
```

### Calling a Cached Function

```typescript
// In a tRPC router or Fastify handler, access via fastify.cache
const result = await fastify.cache.getMyEntity({ entityId: "123" });
```

### Invalidating Cache After Mutations

After any mutation, invalidate all affected references:

```typescript
// Invalidate both the specific entity and the "all" listing
await fastify.cache.invalidateAll([
  `entity~all`,
  `entity~id~${entity.id}`,
]);
```

### Reference Key Conventions

The project uses these reference key patterns:

| Pattern | Example | When to use |
|---------|---------|-------------|
| `entity~all` | `course~all` | Invalidate all listings |
| `entity~id~{id}` | `course~id~abc123` | Invalidate a specific entity |
| `entity~user~{userId}` | `notification~user~xyz` | Invalidate user-scoped data |

---

## TanStack React-DB + query-db-collection

**Packages**: `@tanstack/react-db` + `@tanstack/query-db-collection`  
**Location**: All collections in `apps/web/src/lib/db.collections.ts`

### Creating a Collection

```typescript
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection, eq, useLiveQuery } from "@tanstack/react-db";
import type { AllItems } from "@apps/server/src/routers/items/queries.js";
import { trpc, trpcClient } from "~/lib/trpc.client";
import { queryClient } from "~/lib/query-client";
import { ulid } from "ulid";

export type Item = AllItems[number];

export const ItemsCollection = createCollection(
  queryCollectionOptions<Item>({
    queryClient,                                     // TanStack Query client
    getKey: (item) => item.id,                       // Primary key extractor
    queryKey: trpc.items.getAll.queryKey(),          // Integrates with React Query cache
    queryFn: () => trpcClient.items.getAll.query(), // Fetches data
    onInsert: async ({ transaction }) => {
      const { modified } = transaction.mutations[0];
      return trpcClient.items.create.mutate({ ...modified });
    },
    onUpdate: async ({ transaction }) => {
      const { modified } = transaction.mutations[0];
      return trpcClient.items.update.mutate({ ...modified });
    },
    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0];
      await trpcClient.items.delete.mutate({ id: original.id });
    },
  }),
);
```

### Writing Hook Functions

```typescript
// Hook for all items
export function useItems() {
  return useLiveQuery(ItemsCollection);
}

// Hook for filtered query (single item by ID)
export function useItemById({ itemId }: { itemId: string }) {
  return useLiveQuery(
    (query) =>
      query
        .from({ item: ItemsCollection })
        .where(({ item }) => eq(item.id, itemId))
        .findOne(),
    [itemId],  // dependency array for memoization
  );
}
```

### Preloading in Route Loaders

Always preload collections in route loaders to eliminate loading spinners:

```typescript
export const Route = createFileRoute("/_authenticated/items")({
  loader: async () => {
    await ItemsCollection.preload();
  },
  component: ItemsPage,
});
```

For multiple collections, preload in parallel:

```typescript
await Promise.all([ItemsCollection.preload(), OtherCollection.preload()]);
```

### Inserting with ULID

```typescript
const tx = ItemsCollection.insert({
  id: ulid(),    // Always generate a ULID for the client-side ID
  ...itemData,
});
await tx.isPersisted.promise;  // Wait for server confirmation
```

### Error Handling in CRUD Handlers

Wrap all onInsert/onUpdate/onDelete handlers:

```typescript
onInsert: async ({ transaction }) => {
  try {
    const { modified } = transaction.mutations[0];
    return await trpcClient.items.create.mutate({ ...modified });
  } catch (error) {
    console.error("Failed to create item:", error);
    toast.error("Failed to save. Please try again.");
    throw error;  // Re-throw to roll back the optimistic update
  }
},
```

---

## TanStack Form

**Package**: `@tanstack/react-form`  
**Validation**: Zod 4 schemas via `validators: { onBlur, onSubmit }`

### Basic Form Structure

```tsx
import { useForm } from "@tanstack/react-form";
import { mySchema } from "~/schema/my-form";
import FieldInfo from "~/components/field-info";

export default function MyForm() {
  const form = useForm({
    defaultValues: { title: "", description: "" },
    validators: {
      onBlur: mySchema,    // Validate on field blur
      onSubmit: mySchema,  // Validate on form submit
    },
    onSubmit: async ({ value }) => {
      // value is fully typed and validated
      await doSomething(value);
    },
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
      noValidate  // Disable browser native validation
    >
      <form.Field
        name="title"
        children={({ state, handleChange, handleBlur }) => (
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              state={state}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <FieldInfo field={state} />  {/* Renders validation errors */}
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.isDirty, state.isSubmitting]}
        children={([isDirty, isSubmitting]) => (
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        )}
      />
    </form>
  );
}
```

### FieldInfo Component

The `~/components/field-info.tsx` helper displays validation errors for a field:

```tsx
import type { AnyFieldApi } from "@tanstack/react-form";

export default function FieldInfo({ field }: { field: AnyFieldApi }) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <>
      {isInvalid && (
        <em className="ml-6 text-sm/6 text-red-600">
          {field.state.meta.errors.map((e) => e.message).join(", ")}
        </em>
      )}
    </>
  );
}
```

### Navigation Blocker

Use `<BlockerComponent formIsDirty={isDirty} />` to prevent accidental navigation
away from an unsaved form:

```tsx
<form.Subscribe
  selector={(state) => [state.isDirty]}
  children={([isDirty]) => <BlockerComponent formIsDirty={isDirty} />}
/>
```

### Zod Schema for Forms

```typescript
// src/schema/my-form.ts
import { z } from "zod";

export const myFormSchema = z.object({
  email: z.string().trim().check(z.email()),    // Trim before email validation
  title: z.string().trim().min(1, "Required"),  // Trim before min check
  url: z.string().trim().check(z.url()),        // Trim before URL validation
});

export type MyFormValues = z.infer<typeof myFormSchema>;
```
