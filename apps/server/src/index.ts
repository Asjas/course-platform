import closeWithGrace from "close-with-grace";
import config from "~/config.js";
import { pool } from "~/db/index.js";
import { polarPool } from "~/lib/auth.server.js";
import createServer from "~/server.js";

const app = await createServer(config);

process.on("uncaughtException", (err) => {
  app.log.error({ err }, "Uncaught Exception occurred");
  // Do NOT re-call closeWithGrace() here — it re-registers handlers and
  // immediately ends the DB pool, which crashes all subsequent requests.
  // The closeWithGrace handler below handles SIGTERM/SIGINT gracefully.
  // Transient DB connection errors are caught by the per-client error
  // handler in db/index.ts and will never reach here.
});

process.on("unhandledRejection", (reason, promise) => {
  app.log.error({ reason, promise }, "Unhandled Rejection occurred");
});

closeWithGrace(async function ({ signal, err }) {
  if (err) {
    app.log.error({ err }, "Server closing with error");
  } else {
    app.log.info(`${signal} received, server closing`);
  }

  await polarPool.close();
  await pool.end();
  await app.close();
});

await app.listen({ port: config.PORT, host: config.HOST });
