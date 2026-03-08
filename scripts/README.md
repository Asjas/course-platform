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
- `schema_name` (optional): Database schema to use. Falls back to `DATABASE_SCHEMA` env var, then defaults to `"public"`.

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string. Required for CI, defaults to `postgresql://localhost:5432/course_platform` for local development.
- `DATABASE_SCHEMA`: Schema name to use (overridden by CLI argument if provided). Defaults to `"public"`.

**Example:**
```bash
# Seed public schema
tsx scripts/seed-test-data.ts

# Seed test schema for PR #123
tsx scripts/seed-test-data.ts test_pr_123

# Seed using DATABASE_SCHEMA env var
DATABASE_SCHEMA=ci_server_20 tsx scripts/seed-test-data.ts
```

### `cleanup-test-data.ts`

Cleans up test data from the database.

**Usage:**
```bash
tsx scripts/cleanup-test-data.ts [schema_name]
```

**Parameters:**
- `schema_name` (optional): Database schema to clean. Falls back to `DATABASE_SCHEMA` env var, then defaults to `"public"`.

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string. Required for CI, defaults to `postgresql://localhost:5432/course_platform` for local development.
- `DATABASE_SCHEMA`: Schema name to clean (overridden by CLI argument if provided). Defaults to `"public"`.

**Behavior:**
- For non-public schemas: Drops the entire schema (CASCADE)
- For public/my_schema: Truncates all tables (CASCADE)

**Example:**
```bash
# Clean public schema (truncate tables)
tsx scripts/cleanup-test-data.ts

# Drop test schema completely
tsx scripts/cleanup-test-data.ts test_pr_123

# Clean using DATABASE_SCHEMA env var
DATABASE_SCHEMA=ci_server_20 tsx scripts/cleanup-test-data.ts
```

### `ci-migrate.ts`

Runs Drizzle migrations with a configurable schema name for CI isolation. Each CI job gets its own PostgreSQL schema, preventing deadlocks and data conflicts when running concurrently.

**Usage:**
```bash
DATABASE_SCHEMA=ci_server_20 DATABASE_URL=... tsx scripts/ci-migrate.ts
```

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string. Required.
- `DATABASE_SCHEMA`: Target schema name. Defaults to `"my_schema"`.

**How It Works:**
1. Reads migration SQL files from `apps/server/drizzle/` in order
2. Replaces `"my_schema"` references with the target schema name
3. Executes each migration statement directly against the database
4. Ignores "already exists" errors for safe re-runs
5. Bypasses Drizzle's migration journal (CI schemas are ephemeral)

## CI/CD Integration

These scripts are automatically used in the GitHub Actions CI pipeline with a **hosted PostgreSQL database** dedicated to CI:

1. **Set Schema Name**: Each CI job sets a unique `DATABASE_SCHEMA` env var (e.g., `ci_server_22_<run_id>`)
2. **Run Migrations**: `ci-migrate.ts` creates the schema and runs migrations with the correct schema name
3. **Seed Data**: `seed-test-data.ts` populates the schema with test data
4. **Run Tests**: Tests execute against the isolated schema (Drizzle ORM reads `DATABASE_SCHEMA` at runtime)
5. **Cleanup**: `cleanup-test-data.ts` drops the schema (even on failure)

The CI uses:
- **Hosted Database**: `DATABASE_URL` secret points to a dedicated CI database
- **Dynamic schema names**: `DATABASE_SCHEMA` env var set per job using the pattern `ci_<job>_<node_version>_<run_id>`
- **Full concurrency**: All jobs run in parallel since each uses its own isolated schema

Example schema names:
- `ci_server_22_12345678` for server tests on Node 22
- `ci_web_24_12345678` for web tests on Node 24
- `ci_e2e_25_12345678` for E2E tests on Node 25

This approach allows all CI jobs to run concurrently without conflicts, as each job uses its own fully isolated database schema (including tables, constraints, indexes, and sequences) within the shared hosted database.

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

### Schema Configuration

The schema name is configurable via the `DATABASE_SCHEMA` environment variable:
- **Default**: `my_schema` (used in local development)
- **CI**: Set to a unique name per job (e.g., `ci_server_20_12345678`)

The schema name flows through:
1. `apps/server/src/db/my-schema.ts` — reads `DATABASE_SCHEMA` env var for Drizzle ORM runtime
2. `scripts/ci-migrate.ts` — replaces `"my_schema"` in migration SQL for CI
3. `scripts/seed-test-data.ts` — uses `DATABASE_SCHEMA` env var for seeding
4. `scripts/cleanup-test-data.ts` — uses `DATABASE_SCHEMA` env var for cleanup

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

The scripts support schema-level isolation using PostgreSQL schemas, which allows:

- **Concurrent test runs** in CI without conflicts
- **Parallel testing** across different Node.js versions and job types
- **Clean separation** between test environments
- **Fast cleanup** by dropping schemas instead of truncating tables

### How It Works

1. **Schema Name**: Each CI job sets `DATABASE_SCHEMA` to a unique name (e.g., `ci_server_22_12345678`)
2. **Migration**: `ci-migrate.ts` reads SQL files, replaces `"my_schema"`, and executes them — creating all tables in the isolated schema
3. **Runtime**: Drizzle ORM reads `DATABASE_SCHEMA` from environment and qualifies all table references with the correct schema
4. **Seeding**: `seed-test-data.ts` sets `search_path` to the target schema for data insertion
5. **Tests**: Application code uses the correct schema via `DATABASE_SCHEMA` env var
6. **Cleanup**: The entire schema is dropped, removing all data and structures instantly

