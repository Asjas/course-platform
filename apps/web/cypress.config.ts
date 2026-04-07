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

// Shared connection pool for Cypress tasks — avoids exhausting PostgreSQL
// connections by reusing a small number of clients across all task calls.
let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 30000,
    });
    // Prevent unhandled 'error' events from crashing the Cypress process
    // when an idle client is unexpectedly terminated by the server.
    pool.on("error", () => {
      pool = null;
    });
  }
  return pool;
}

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
          const client = await getPool().connect();
          try {
            await client.query(
              `UPDATE "${dbSchema}"."user" SET role = $1 WHERE email = $2`,
              [role, email],
            );
            return null;
          } finally {
            client.release();
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
          const client = await getPool().connect();
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
            client.release();
          }
        },
        async createEarlySignup({
          id,
          email,
          name,
          source,
          confirmedAt,
          unsubscribedAt,
        }: {
          id: string;
          email: string;
          name: string;
          source?: "learnfastify" | "codewizard" | "other";
          confirmedAt?: string | null;
          unsubscribedAt?: string | null;
        }) {
          const client = await getPool().connect();
          try {
            await client.query(
              `
                INSERT INTO "${dbSchema}"."early_signup"
                (id, email, name, source, confirmed_at, unsubscribed_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (email) DO UPDATE
                SET
                  name = EXCLUDED.name,
                  source = EXCLUDED.source,
                  confirmed_at = EXCLUDED.confirmed_at,
                  unsubscribed_at = EXCLUDED.unsubscribed_at
              `,
              [
                id,
                email,
                name,
                source ?? "learnfastify",
                confirmedAt ? new Date(confirmedAt) : null,
                unsubscribedAt ? new Date(unsubscribedAt) : null,
              ],
            );
            return null;
          } finally {
            client.release();
          }
        },
        async setCoursePublished({
          courseId,
          published,
        }: {
          courseId: string;
          published: boolean;
        }) {
          const client = await getPool().connect();
          try {
            await client.query(
              `UPDATE "${dbSchema}"."course" SET published = $1 WHERE id = $2`,
              [published, courseId],
            );
            return null;
          } finally {
            client.release();
          }
        },
      });

      return config;
    },
  },
});
