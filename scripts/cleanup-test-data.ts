#!/usr/bin/env tsx

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
const databaseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/course_platform";

console.log(`🧹 Cleaning up database schema: ${schemaName}`);

// Create database connection
const pool = new Pool({
  connectionString: databaseUrl,
});

async function cleanupDatabase() {
  try {
    if (schemaName !== "public") {
      // Drop the entire schema for test schemas
      await pool.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      console.log(`✅ Schema "${schemaName}" dropped successfully`);
    } else {
      // For public schema, just truncate tables
      console.log("⚠️  Truncating tables in public schema (not dropping schema)");
      
      const tables = [
        'support_ticket_comment',
        'support_ticket',
        'lesson_progress',
        'course_progress',
        'course_review',
        'course_completion_certificate',
        'course_instructor_note',
        'course_faq',
        'course_wishlist',
        'enrollment',
        'course_lesson',
        'course_module',
        'course',
        'account',
        'session',
        'verification',
        'user',
      ];
      
      for (const table of tables) {
        try {
          await pool.query(`TRUNCATE TABLE "${schemaName}"."${table}" CASCADE`);
          console.log(`  ✓ Truncated ${table}`);
        } catch (error: any) {
          // Table might not exist, that's okay
          if (!error.message.includes('does not exist')) {
            console.error(`  ✗ Error truncating ${table}:`, error.message);
          }
        }
      }
      
      console.log("✅ Public schema tables truncated");
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
