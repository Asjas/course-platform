import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import mailer from "~/lib/mailer.js";

declare module "fastify" {
  interface FastifyInstance {
    mailer: typeof mailer;
  }
}

function MailPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.decorate("mailer", mailer);

  done();
}

export default MailPlugin;
