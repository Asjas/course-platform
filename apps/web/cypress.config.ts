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

export default defineConfig({
  allowCypressEnv: false,
  expose: {
    apiUrl: process.env.VITE_BETTER_AUTH_URL || "http://localhost:5000",
  },
  e2e: {
    baseUrl: "http://localhost:4173",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on) {
      on("task", {
        async setUserRole({ email, role }: { email: string; role: string }) {
          const client = new pg.Client({
            connectionString: process.env.DATABASE_URL,
          });
          await client.connect();
          try {
            await client.query(
              `UPDATE my_schema."user" SET role = $1 WHERE email = $2`,
              [role, email],
            );
            return null;
          } finally {
            await client.end();
          }
        },
      });
    },
  },
});
