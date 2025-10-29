import { fromNodeHeaders } from "better-auth/node";
import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import fastifyBetterAuth, { getAuthDecorator } from "fastify-better-auth";
import type { User } from "~/db/schema/user.js";
import { auth } from "~/lib/auth.server.js";

export default function betterAuthPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.decorateRequest("user", null);

  fastify.register(fastifyBetterAuth, { auth });

  fastify.addHook("onRequest", async (request, reply) => {
    const auth = getAuthDecorator(reply.server);

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    request.user = session?.user as User;
  });

  done();
}
