import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";
import config from "~/config.js";
import * as schemas from "~/db/schema/index.js";

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 100,
  Client,
});

await pool.connect();

export { pool };

export const db = drizzle({
  schema: schemas,
  client: pool,
  casing: "snake_case",
});
