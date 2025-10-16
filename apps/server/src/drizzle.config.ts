import { defineConfig } from "drizzle-kit";
import config from "~/config.js";

export default defineConfig({
  out: "./drizzle",
  schema: ["src/db/my-schema.ts", "src/db/schema"],
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL,
  },
  casing: "snake_case",
});
