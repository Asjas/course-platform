import closeWithGrace from "close-with-grace";
import config from "~/config.js";
import { pool } from "~/db/index.js";
import { polarPool } from "~/lib/auth.server.js";
import createServer from "~/server.js";

const app = await createServer(config);

process.on("uncaughtException", (err) => {
  app.log.error({ err }, "Uncaught Exception occurred");

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
