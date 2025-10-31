import * as schemas from "./schema";
import config from "@packages/schema/db-config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 100,
  Client,
});

await pool.connect();

export { pool };

export const db = drizzle({
  schema: {
    ...schemas,
  },
  client: pool,
  casing: "snake_case",
});

export { eq, sql } from "drizzle-orm";
export { schemas };
