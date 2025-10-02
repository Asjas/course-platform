import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";
import config from "~/config.js";
import { mySchema } from "~/db/schema.js";
import * as schemas from "~/db/schema/index.js";

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 100,
  Client,
});

console.log("pool", pool.options.Client);

await pool.connect();

console.log("pool", pool);

export const db = drizzle({
  schema: {
    mySchema,
    ...schemas,
  },
  client: pool,
  casing: "snake_case",
});
