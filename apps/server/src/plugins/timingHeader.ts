import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import type { Config } from "~/config.js";

export default function timingHeaderPlugin(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & { config: Config },
  done: HookHandlerDoneFunction,
) {
  fastify.addHook(
    "onSend",
    function timingHeaderOnSend(_request, reply, _payload, done) {
      reply.header("Timing-Allow-Origin", opts.config.ORIGIN);

      done();
    },
  );

  done();
}
