/**
 * Debug script to verify seeded data in the database
 * Used by CI workflow to troubleshoot authentication issues
 * TODO: Remove this file after e2e authentication issues are resolved
 */
import * as schema from "../apps/server/src/db/my-schema.js";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const queryClient = postgres(DATABASE_URL);
const db = drizzle({ client: queryClient, schema });

async function main() {
  console.log("=== DEBUG: Checking Seeded Data ===\n");

  try {
    // Check users
    const users = await db
      .select({
        id: schema.user.id,
        email: schema.user.email,
        name: schema.user.name,
        role: schema.user.role,
      })
      .from(schema.user);

    console.log(`Found ${users.length} users:`);
    users.forEach((user) => {
      console.log(
        `  - ${user.email} (${user.name}, role: ${user.role}, id: ${user.id})`,
      );
    });
    console.log();

    // Check accounts with password hashes
    const accounts = await db
      .select({
        userId: schema.account.userId,
        providerId: schema.account.providerId,
        passwordPrefix: sql<string>`SUBSTRING(${schema.account.password}::text, 1, 9)`,
      })
      .from(schema.account)
      .where(eq(schema.account.providerId, "credential"));

    console.log(`Found ${accounts.length} credential accounts:`);
    accounts.forEach((account) => {
      console.log(
        `  - userId: ${account.userId}, provider: ${account.providerId}, password starts with: ${account.passwordPrefix}`,
      );
    });
    console.log();

    // Verify test user exists
    const testUser = users.find((u) => u.email === "test@example.com");
    const testUserAccount = accounts.find(
      (a) => a.userId === testUser?.id && a.providerId === "credential",
    );

    console.log(`Test user exists: ${!!testUser}`);
    console.log(`Test user account exists: ${!!testUserAccount}`);
    console.log(
      `Test user password hash format looks correct (starts with $argon2): ${testUserAccount?.passwordPrefix?.startsWith("$argon2") ?? false}`,
    );
  } catch (error) {
    console.error("Error checking seeded data:", error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

main();
