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

// Get schema name from: 1) command line argument, 2) DATABASE_SCHEMA env var, or 3) default to "public"
const schemaName = process.argv[2] || process.env.DATABASE_SCHEMA || "public";
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://localhost:5432/course_platform";

console.log(`🧹 Cleaning up database schema: ${schemaName}`);

// Create database connection with search_path set to the target schema
// This ensures all queries use the correct schema
let connectionString = databaseUrl;
if (schemaName !== "public") {
  // Append search_path option to connection string
  // URL-encode the schema name to handle special characters like dots
  const separator = databaseUrl.includes("?") ? "&" : "?";
  const encodedSchemaName = encodeURIComponent(schemaName);
  connectionString = `${databaseUrl}${separator}options=-c%20search_path%3D${encodedSchemaName}`;
}

// Append PostgreSQL libpq keepalive parameters to prevent idle connection drops.
const keepaliveSep = connectionString.includes("?") ? "&" : "?";
connectionString = `${connectionString}${keepaliveSep}keepalives=1&keepalives_idle=300&keepalives_interval=10&keepalives_count=10`;

const pool = new Pool({
  connectionString,
});

async function cleanupDatabase() {
  try {
    // For my_schema and public, just truncate tables (don't drop the schema)
    if (schemaName === "public" || schemaName === "my_schema") {
      console.log(
        `⚠️  Truncating tables in ${schemaName} schema (not dropping schema)`,
      );

      const tables = [
        // Support
        "support_ticket_comment",
        "support_ticket",
        // Progress
        "lesson_progress",
        "course_progress",
        // Reviews and course content
        "course_review",
        "course_completion_certificate",
        "course_instructor_note",
        "course_faq",
        "course_wishlist",
        // Coupons
        "coupon_redemption",
        "coupon",
        // Enrollments
        "enrollment",
        // Course hierarchy
        "course_lesson",
        "course_module",
        "course",
        // Announcements
        "platform_announcement_read",
        "platform_announcement",
        // Team licenses
        "team_license_invite",
        "team_license",
        // Purchases
        "payment",
        "invoice",
        // Chat
        "chat_message_report",
        "direct_message_request",
        "direct_message_conversation",
        // Notifications and sync
        "user_notification",
        "sync_status",
        "gdpr_audit_log",
        // Auth tables
        "account",
        "session",
        "verification",
        "invitation",
        "member",
        "organization",
        "early_signup",
        "user",
      ];

      for (const table of tables) {
        try {
          // No schema prefix - rely on search_path set via connection string
          await pool.query(`TRUNCATE TABLE "${table}" CASCADE`);
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
