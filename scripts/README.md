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

1. **Create Schema**: A unique test schema is created for each CI job
2. **Run Migrations**: Drizzle migrations are run with `search_path` set to the test schema
3. **Seed Data**: `seed-test-data.ts` populates the test schema with test data
4. **Run Tests**: Tests execute against the isolated test schema
5. **Cleanup**: `cleanup-test-data.ts` drops the test schema (even on failure)

The CI uses:
- **Hosted Database**: `DATABASE_URL` secret points to a dedicated CI database
- **PostgreSQL search_path**: Migrations are run with `search_path` parameter to target specific schemas
- **Unique schema names** based on PR number and Node.js version to allow concurrent test runs:
  ```
  test_pr_<PR_NUMBER>_<NODE_VERSION>
  ```
  Example: `test_pr_456_20.x` for server tests, `test_pr_456_web_20.x` for web tests

This approach allows multiple CI jobs to run concurrently without conflicts, as each job uses its own fully isolated database schema (including tables, constraints, indexes, and sequences) within the shared hosted database.

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

The scripts support schema-level isolation using PostgreSQL's native `search_path` feature, which allows:

- **Concurrent test runs** in CI without conflicts
- **Parallel testing** across different Node.js versions
- **Clean separation** between test environments
- **Fast cleanup** by dropping schemas instead of truncating tables
- **Native Drizzle migrations** that work seamlessly with schema isolation

### How It Works

1. **Schema Creation**: Each test run creates a unique schema (e.g., `test_pr_123_20.x`)
2. **Migration with search_path**: Drizzle migrations run with `DATABASE_URL` parameter `?options=-c%20search_path=test_pr_123_20.x`
3. **Schema Structure**: Migrations create all tables, indexes, constraints, and sequences in the test schema
4. **Data Seeding**: Seed script sets `search_path` and populates data in the isolated schema
5. **Test Execution**: Tests run against the isolated schema
6. **Cleanup**: The entire schema is dropped, removing all data and structures instantly

This approach leverages PostgreSQL's native schema isolation and Drizzle ORM's connection-level configuration, resulting in a robust and efficient CI testing strategy.

