import codeCoverageTask from "@cypress/code-coverage/task";
import { defineConfig } from "cypress";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

// Load DATABASE_URL from server .env for the setUserRole task
try {
  const envPath = resolve(__dirname, "../server/.env");
  const envContent = readFileSync(envPath, "utf-8");

  if (!process.env.DATABASE_URL) {
    const dbMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
    if (dbMatch) {
      process.env.DATABASE_URL = dbMatch[1];
    }
  }
} catch {
  // Ignore if file doesn't exist (CI sets env vars directly)
}

// Use DATABASE_SCHEMA env var when running in CI with schema isolation,
// otherwise fall back to the default "my_schema".
const dbSchema = process.env.DATABASE_SCHEMA || "my_schema";

export default defineConfig({
  allowCypressEnv: false,
  expose: {
    apiUrl: process.env.VITE_BETTER_AUTH_URL || "http://localhost:5000",
    coverage: process.env.CYPRESS_COVERAGE === "true",
  },
  e2e: {
    baseUrl: "http://localhost:4173",
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);

      on("task", {
        async setUserRole({ email, role }: { email: string; role: string }) {
          const client = new pg.Client({
            connectionString: process.env.DATABASE_URL,
          });
          await client.connect();
          try {
            await client.query(
              `UPDATE "${dbSchema}"."user" SET role = $1 WHERE email = $2`,
              [role, email],
            );
            return null;
          } finally {
            await client.end();
          }
        },
        async createTestUser({
          id,
          name,
          email,
          role,
        }: {
          id: string;
          name: string;
          email: string;
          role?: "member" | "admin";
        }) {
          const client = new pg.Client({
            connectionString: process.env.DATABASE_URL,
          });
          await client.connect();
          try {
            await client.query(
              `
                INSERT INTO "${dbSchema}"."user" (id, name, email, role)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO NOTHING
              `,
              [id, name, email, role ?? "member"],
            );
            return null;
          } finally {
            await client.end();
          }
        },
      });

      return config;
    },
  },
});
