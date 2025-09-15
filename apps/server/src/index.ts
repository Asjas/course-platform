import config from "~/config.js";
import createServer from "~/server.js";

async function startServer() {
  try {
    const PORT = Number(config.PORT) || 3000;
    const app = await createServer(config);

    await app.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    console.error(err);
  }
}

startServer();
