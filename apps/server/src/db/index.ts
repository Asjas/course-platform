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
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  Client,
});

await pool.connect();

// Enable TCP keep-alive on every new client connection to prevent ECONNRESET
// from network equipment or database server idle-connection timeouts in CI.
pool.on("connect", (client) => {
  // @ts-expect-error -- pg client exposes the socket via .connection.stream
  client.connection?.stream?.setKeepAlive(true, 10000);
});

// Handle connection errors gracefully – log and allow the pool to reconnect.
// Do NOT re-throw; throwing here would become an uncaughtException and crash
// the server.
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
