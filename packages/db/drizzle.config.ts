import config from "@packages/schema/config.js";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: ["src/db/my-schema.ts", "src/db/schema"],
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL,
  },
  casing: "snake_case",
});
