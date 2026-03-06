import { defineConfig } from "cypress";
import pg from "pg";

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
