import { fromNodeHeaders } from "better-auth/node";
import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import fastifyBetterAuth, { getAuthDecorator } from "fastify-better-auth";
import { auth } from "~/lib/auth.server.js";
import type { User } from "~/routers/users/mutations.js";

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

  // Override the sign-out endpoint to add the Clear-Site-Data header
  fastify.post("/api/auth/sign-out", async (request, reply) => {
    const auth = getAuthDecorator(reply.server);

    await auth.api.signOut({
      headers: fromNodeHeaders(request.headers),
    });

    // Set the Clear-Site-Data header
    reply.header("Clear-Site-Data", "*");

    return reply.status(200).send({ message: "Logged out successfully" });
  });

  done();
}
