/**
 * CI Migration Script
 *
 * Runs Drizzle migrations with a configurable schema name for CI isolation.
 * Each CI job gets its own PostgreSQL schema, preventing deadlocks and
 * data conflicts when jobs run concurrently against a shared database.
 *
 * Usage:
 *   DATABASE_SCHEMA=ci_server_20 DATABASE_URL=... tsx scripts/ci-migrate.ts
 *
 * The script reads migration SQL files from apps/server/drizzle/,
 * replaces "my_schema" with the target schema name, and executes
 * each migration directly. It bypasses Drizzle's migration journal
 * since CI schemas are ephemeral (created fresh and dropped after tests).
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

      // Replace the hardcoded schema name with the target schema
      sql = sql.replaceAll('"my_schema"', `"${schemaName}"`);

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
          // This allows re-running migrations safely in CI
          if (err.code === "42710" || err.code === "42P07") {
            continue;
          }
          console.error(`  ❌ Error in ${file}:`, err.message);
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
