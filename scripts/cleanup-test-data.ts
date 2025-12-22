/**
 * Database Cleanup Script for Test Data
 *
 * This script cleans up test data from a specified schema.
 *
 * Usage:
 *   tsx scripts/cleanup-test-data.ts [schema_name]
 *
 * The schema_name defaults to "public" but can be set to any schema (e.g., "test_pr_123")
 * to support concurrent test runs in CI.
 */
import pg from "pg";

const { Pool } = pg;

// Get schema name from command line or use public
const schemaName = process.argv[2] || "public";
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://localhost:5432/course_platform";

console.log(`🧹 Cleaning up database schema: ${schemaName}`);

// Create database connection
const pool = new Pool({
  connectionString: databaseUrl,
});

async function cleanupDatabase() {
  try {
    // For my_schema and public, just truncate tables (don't drop the schema)
    if (schemaName === "public" || schemaName === "my_schema") {
      console.log(
        `⚠️  Truncating tables in ${schemaName} schema (not dropping schema)`,
      );

      const tables = [
        "support_ticket_comment",
        "support_ticket",
        "lesson_progress",
        "course_progress",
        "course_review",
        "course_completion_certificate",
        "course_instructor_note",
        "course_faq",
        "course_wishlist",
        "coupon_redemption",
        "coupon",
        "enrollment",
        "course_lesson",
        "course_module",
        "course",
        "platform_announcement",
        "team_license_seat",
        "team_license",
        "purchase",
        "account",
        "session",
        "verification",
        "user",
      ];

      for (const table of tables) {
        try {
          await pool.query(`TRUNCATE TABLE "${schemaName}"."${table}" CASCADE`);
          console.log(`  ✓ Truncated ${table}`);
        } catch (error: unknown) {
          // Table might not exist, that's okay
          const errMessage = (error as Error).message;
          if (!errMessage.includes("does not exist")) {
            console.error(`  ✗ Error truncating ${table}:`, errMessage);
          }
        }
      }

      console.log(`✅ ${schemaName} schema tables truncated`);
    } else {
      // For other test schemas, drop the entire schema
      // Check if schema exists first
      const schemaCheck = await pool.query(
        `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
        [schemaName],
      );

      if (schemaCheck.rows.length === 0) {
        console.log(
          `ℹ️  Schema "${schemaName}" does not exist, nothing to clean up`,
        );
        return;
      }

      // Drop the entire schema for test schemas
      await pool.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      console.log(`✅ Schema "${schemaName}" dropped successfully`);
    }
  } catch (error) {
    console.error("❌ Error cleaning up database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run cleanup
cleanupDatabase().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
