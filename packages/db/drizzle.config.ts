import config from "@packages/schema/db-config.js";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: ["src/schema"],
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL,
  },
  casing: "snake_case",
});
