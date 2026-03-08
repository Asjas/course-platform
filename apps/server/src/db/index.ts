import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";
import config from "~/config.js";
import { mySchema } from "~/db/my-schema.js";
import * as schemas from "~/db/schema/index.js";

const isCI = process.env.CI === "true";

// Append PostgreSQL libpq keepalive parameters to the connection URL.
// These are separate from Node.js TCP keepalive (keepAlive / setKeepAlive)
// and tell the PostgreSQL server to send keepalive probes, which prevents
// network equipment and managed database providers from dropping idle
// connections silently.
const keepaliveParams =
  "keepalives=1&keepalives_idle=300&keepalives_interval=10&keepalives_count=10";
const separator = config.DATABASE_URL.includes("?") ? "&" : "?";
const connectionString = `${config.DATABASE_URL}${separator}${keepaliveParams}`;

const pool = new Pool({
  connectionString,
  max: isCI ? 10 : 100,
  min: isCI ? 1 : 10,
  idleTimeoutMillis: isCI ? 10_000 : 30_000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  Client,
});

// Register error handlers BEFORE the first client is created.  pool.connect()
// and pool.query() both create clients that fire the "connect" event.  If these
// handlers are registered after the first client is created the initial client
// won't have the error listener, and a server-side connection kill (e.g. managed
// PostgreSQL 10-min lifetime) will become an uncaughtException → close-with-grace
// calls pool.end() → every subsequent query fails with "Cannot use a pool after
// calling end on the pool".

// Enable TCP keep-alive on every new client connection to prevent ECONNRESET
// from network equipment or database server idle-connection timeouts in CI.
// Also attach a per-client error listener so a connection termination on a
// checked-out (but query-idle) client doesn't become an uncaughtException.
pool.on("connect", (client) => {
  // @ts-expect-error -- pg client exposes the socket via .connection.stream
  client.connection?.stream?.setKeepAlive(true, 10000);
  client.on("error", (err) => {
    console.error("Database client error:", err.message);
  });
});

// Handle connection errors gracefully – log and allow the pool to reconnect.
// Do NOT re-throw; throwing here would become an uncaughtException and crash
// the server.
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

// Verify the database connection works.  Using pool.query() instead of
// pool.connect() so the client is properly returned to the idle pool
// afterwards (pool.connect() without release() leaks the client).
await pool.query("SELECT 1");

export { pool };

export const db = drizzle({
  schema: {
    mySchema,
    ...schemas,
  },
  client: pool,
  casing: "snake_case",
});
