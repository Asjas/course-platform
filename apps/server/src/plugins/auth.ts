import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import type { User } from "~/db/mutations/user.js";

declare module "fastify" {
  interface FastifyRequest {
    user: Pick<
      User,
      "id" | "email" | "emailVerified" | "role" | "banned"
    > | null;
  }
}

function authPlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.decorateRequest("user", null);

  done();
}

export default authPlugin;
