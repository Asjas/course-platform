import closeWithGrace from "close-with-grace";
import config from "~/config.js";
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

    await app.close();
  });
});

closeWithGrace(async function ({ signal, err }) {
  if (err) {
    app.log.error({ err }, "Server closing with error");
  } else {
    app.log.info(`${signal} received, server closing`);
  }

  await app.close();
});

await app.listen({ port: config.PORT, host: config.HOST });
