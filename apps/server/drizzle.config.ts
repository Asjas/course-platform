import { invariant } from "@epic-web/invariant";
import "dotenv/config";
import { type Config, defineConfig } from "drizzle-kit";

invariant(process.env.DATABASE_URL, "`DATABASE_URL` needs to be specified");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  casing: "snake_case",
}) satisfies Config;
