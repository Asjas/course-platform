import { defineConfig } from "drizzle-kit";

// Read DATABASE_URL directly from environment to avoid module resolution issues
// when drizzle-kit executes this config file directly
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  out: "../drizzle",
  schema: ["./db/my-schema.ts", "./db/schema"],
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  casing: "snake_case",
});
