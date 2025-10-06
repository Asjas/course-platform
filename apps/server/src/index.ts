import closeWithGrace from "close-with-grace";
import config from "~/config.js";
import { sdk } from "~/lib/otel.js";
import createServer from "~/server.js";

const PORT = Number(config.PORT) || 3000;
const app = await createServer(config);

closeWithGrace(async function ({ signal, err }) {
  if (err) {
    app.log.error({ err }, "Server closing with error");
  } else {
    app.log.info(`${signal} received, server closing`);
  }

  sdk
    .shutdown()
    .then(() => console.log("SDK shut down successfully"))
    .catch((err) => console.error(err));

  await app.close();
});

await app.listen({ port: PORT, host: "0.0.0.0" });

console.log("Node.js flags:", process.execArgv);
