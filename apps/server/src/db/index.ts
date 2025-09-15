import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import config from "~/config.js";

const client = new Client({ connectionString: config.DATABASE_URL });

await client.connect();

export const db = drizzle({
  client: client,
  logger: config.NODE_ENV === "development",
  casing: "camelCase",
});
