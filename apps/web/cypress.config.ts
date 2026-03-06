import { defineConfig } from "cypress";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

// Load DATABASE_URL from server .env if not already set
if (!process.env.DATABASE_URL) {
  try {
    const envPath = resolve(__dirname, "../server/.env");
    const envContent = readFileSync(envPath, "utf-8");
    const match = envContent.match(/^DATABASE_URL=(.+)$/m);
    if (match) {
      process.env.DATABASE_URL = match[1];
    }
  } catch {
    // Ignore if file doesn't exist (CI sets DATABASE_URL directly)
  }
}

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4173",
    allowCypressEnv: false,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
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
