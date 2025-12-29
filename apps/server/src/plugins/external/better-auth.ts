import { fromNodeHeaders } from "better-auth/node";
import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import fastifyBetterAuth, { getAuthDecorator } from "fastify-better-auth";
import type { User } from "~/db/schema/user.js";
import { auth } from "~/lib/auth.server.js";
import { notifyAdminNewUserRegistration } from "~/lib/notifications.js";

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

  // Hook to notify admins when a new user registers
  fastify.addHook("onResponse", async (request, reply) => {
    // Check if this is a successful signup response
    if (
      request.url.includes("/api/auth/sign-up/email") &&
      request.method === "POST" &&
      reply.statusCode === 200
    ) {
      try {
        // Parse the response body to get user info
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (session?.user) {
          await notifyAdminNewUserRegistration({
            userName: session.user.name,
            userEmail: session.user.email,
          });
        }
      } catch (error) {
        // Log but don't fail the request
        fastify.log.error(
          error,
          "Failed to send admin notification for new user registration",
        );
      }
    }
  });

  done();
}
