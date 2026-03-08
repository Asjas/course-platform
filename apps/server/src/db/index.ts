import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";
import config from "~/config.js";
import { mySchema } from "~/db/my-schema.js";
import * as schemas from "~/db/schema/index.js";

const isCI = process.env.CI === "true";

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: isCI ? 10 : 100,
  min: isCI ? 2 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  Client,
});

await pool.connect();

// Handle connection errors gracefully
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

export { pool };

export const db = drizzle({
  schema: {
    mySchema,
    ...schemas,
  },
  client: pool,
  casing: "snake_case",
});
