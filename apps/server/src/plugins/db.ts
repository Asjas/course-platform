import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import { db } from "~/db/index.js";

declare module "fastify" {
  interface FastifyInstance {
    db: typeof db;
  }
}

export default function dbPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.decorate("db", db);

  fastify.addHook("onClose", async function dbOnClose() {
    await db.$client.end();
  });

  done();
}
