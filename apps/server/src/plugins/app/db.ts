import { db } from "@packages/db";
import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";

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
