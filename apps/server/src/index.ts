import config from "./config";
import createServer from "./server";

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
