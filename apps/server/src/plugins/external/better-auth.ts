import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import fastifyBetterAuth from "fastify-better-auth";
import { auth } from "~/lib/auth.server.js";

export default function betterAuthPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.decorateRequest("user", null);

  fastify.register(fastifyBetterAuth, { auth });

  done();
}
