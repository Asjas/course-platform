/**
 * CI Migration Script
 *
 * Runs Drizzle migrations with a configurable schema name for CI isolation.
 * Each CI job gets its own PostgreSQL schema, preventing deadlocks and
 * data conflicts when jobs run concurrently against a shared database.
 *
 * Usage:
 *   DATABASE_SCHEMA=ci_server_22 DATABASE_URL=... tsx scripts/ci-migrate.ts
 *
 * The script reads migration SQL files from apps/server/drizzle/,
 * replaces all occurrences of "my_schema" (both double-quoted identifiers
 * and single-quoted string values used in information_schema/pg_type queries)
 * with the target schema name, and executes each migration directly.
 * It bypasses Drizzle's migration journal since CI schemas are ephemeral
 * (created fresh and dropped after tests).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

const schemaName = process.env.DATABASE_SCHEMA || "my_schema";
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://localhost:5432/course_platform";
const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(__dirname, "../apps/server/drizzle");

// Validate schema name to prevent SQL injection (only allow alphanumeric and underscores)
if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schemaName)) {
  console.error(
    `❌ Invalid schema name: "${schemaName}". Only letters, numbers, and underscores are allowed.`,
  );
  process.exit(1);
}

console.log(`🔄 Running CI migrations for schema: "${schemaName}"`);

const pool = new Pool({
  connectionString: databaseUrl,
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    // Ensure the schema is completely fresh — drop any stale state from
    // previous runs (e.g. a re-run with the same github.run_id) before
    // creating a clean schema.  This prevents "already exists" errors from
    // masking real migration issues like missing columns.
    if (schemaName !== "my_schema") {
      console.log(`🗑️  Dropping schema "${schemaName}" if it exists...`);
      await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }
    console.log(`📦 Creating schema "${schemaName}"...`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    // Get all SQL migration files sorted by name (they're numbered 0000, 0001, etc.)
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("⚠️  No migration files found");
      return;
    }

    console.log(`📂 Found ${files.length} migration files`);

    for (const file of files) {
      const filePath = resolve(migrationsDir, file);
      let sql = readFileSync(filePath, "utf-8");

      // Replace ALL occurrences of the hardcoded schema name with the target.
      // Three patterns exist in migration files:
      //   1. "my_schema"  — double-quoted identifiers (e.g. "my_schema"."table")
      //   2. 'my_schema'  — single-quoted string values (e.g. WHERE table_schema = 'my_schema')
      //   3. 'my_schema.  — qualified type names (e.g. 'my_schema.enum_type'::regtype)
      sql = sql.replaceAll('"my_schema"', `"${schemaName}"`);
      sql = sql.replaceAll("'my_schema'", `'${schemaName}'`);
      sql = sql.replaceAll("'my_schema.", `'${schemaName}.`);

      // Split by Drizzle's statement breakpoint marker and execute each statement
      const statements = sql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      console.log(`  ▶ ${file} (${statements.length} statements)`);

      for (const statement of statements) {
        try {
          await client.query(statement);
        } catch (error: unknown) {
          const err = error as Error & { code?: string };
          // Ignore "already exists" errors (42710 = duplicate_object, 42P07 = duplicate_table)
          // These can occur when migration files contain idempotent DO blocks
          if (err.code === "42710" || err.code === "42P07") {
            continue;
          }
          const maxStatementPreview = 500;
          console.error(`  ❌ Error in ${file}:`, err.message);
          console.error(
            `  📝 Failing statement:\n${statement.substring(0, maxStatementPreview)}`,
          );
          throw error;
        }
      }
    }

    console.log("✅ All migrations completed successfully!");
  } finally {
    client.release();
  }
}

void runMigrations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal migration error:", error);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
