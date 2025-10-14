import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import { db } from "~/db/index.js";

export default function dbPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.decorate("db", db);

  fastify.addHook("onClose", async function dbOnClose(fastify) {
    await fastify.db.$client.end();
  });

  done();
}
