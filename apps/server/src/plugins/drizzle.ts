import {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import fp from "fastify-plugin";
import { db } from "~/db/index.js";

declare module "fastify" {
  interface FastifyInstance {
    db: typeof db;
  }
}

function DrizzlePlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.decorate("db", db);

  done();
}

export default fp(DrizzlePlugin);
