// Use relative path because drizzle-kit doesn't resolve ~/* aliases
import config from "./config.js";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: ["src/db/my-schema.ts", "src/db/schema"],
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL,
  },
  casing: "snake_case",
});
