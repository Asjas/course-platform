import { instrumentDrizzle } from "@kubiks/otel-drizzle";
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

await pool.connect();

const instrumentedPool = instrumentDrizzle(pool, {
  dbName: "course-platform-db",
});

export const db = drizzle({
  schema: {
    mySchema,
    ...schemas,
  },
  client: instrumentedPool,
  casing: "snake_case",
});
