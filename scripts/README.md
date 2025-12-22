# Test Data Scripts

This directory contains scripts for managing test data in the course platform database.

## Scripts

### `seed-test-data.ts`

Seeds the database with realistic test data including:
- 20 test users
- 5 courses (with focus on "Learn Fastify" course)
- Modules and lessons for each course
- Enrollments (10 users enrolled in Learn Fastify)
- Course reviews
- Support tickets for lessons

**Usage:**
```bash
tsx scripts/seed-test-data.ts [schema_name]
```

**Parameters:**
- `schema_name` (optional): Database schema to use. Defaults to `"public"`.

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string. Required for CI, defaults to `postgresql://localhost:5432/course_platform` for local development.

**Example:**
```bash
# Seed public schema
tsx scripts/seed-test-data.ts

# Seed test schema for PR #123
tsx scripts/seed-test-data.ts test_pr_123
```

### `cleanup-test-data.ts`

Cleans up test data from the database.

**Usage:**
```bash
tsx scripts/cleanup-test-data.ts [schema_name]
```

**Parameters:**
- `schema_name` (optional): Database schema to clean. Defaults to `"public"`.

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string. Required for CI, defaults to `postgresql://localhost:5432/course_platform` for local development.

**Behavior:**
- For non-public schemas: Drops the entire schema (CASCADE)
- For public schema: Truncates all tables (CASCADE)

**Example:**
```bash
# Clean public schema (truncate tables)
tsx scripts/cleanup-test-data.ts

# Drop test schema completely
tsx scripts/cleanup-test-data.ts test_pr_123
```

## CI/CD Integration

These scripts are automatically used in the GitHub Actions CI pipeline with a **hosted PostgreSQL database** dedicated to CI:

1. **Before Tests**: `seed-test-data.ts` is run to populate the database
2. **After Tests**: `cleanup-test-data.ts` is run (even on failure) to clean up

The CI uses:
- **Hosted Database**: `DATABASE_URL` secret points to a dedicated CI database
- **Unique schema names** based on PR number and Node.js version to allow concurrent test runs:
  ```
  test_pr_<PR_NUMBER>_<NODE_VERSION>
  ```
  Example: `test_pr_456_20.x`

This approach allows multiple CI jobs to run concurrently without conflicts, as each job uses its own isolated schema within the shared hosted database.

## Development

### Local Testing

To test locally with seeded data:

```bash
# Set up database
docker-compose up -d

# Run migrations
pnpm --filter @apps/server drizzle:migrate

# Seed data
tsx scripts/seed-test-data.ts

# Run tests
pnpm test

# Clean up
tsx scripts/cleanup-test-data.ts
```

### Adding New Test Data

To add new types of test data:

1. Edit `seed-test-data.ts`
2. Add a new `generateFake*` function
3. Add the data generation to the `seedDatabase()` function
4. Update this README with the new data type

## Dependencies

- `@faker-js/faker`: Generates realistic fake data
- `drizzle-orm`: Database ORM
- `pg`: PostgreSQL client
- `ulid`: Generates unique IDs

## Schema Isolation

The scripts support schema-level isolation, which allows:

- **Concurrent test runs** in CI without conflicts
- **Parallel testing** across different Node.js versions
- **Clean separation** between test environments
- **Fast cleanup** by dropping schemas instead of truncating tables

Each test run creates its own isolated schema, runs tests, and cleans up automatically.

