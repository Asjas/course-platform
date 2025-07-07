import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import fp from "fastify-plugin";
import { db } from "~/db";

declare module "fastify" {
  interface FastifyInstance {
    db: typeof db;
  }
}

function DrizzlePlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.decorate("db", db);

  done();
}

export default fp(DrizzlePlugin);
