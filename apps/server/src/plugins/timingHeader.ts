import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import type { Config } from "~/config.js";

function timingHeader(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & { config: Config },
  done: HookHandlerDoneFunction,
) {
  fastify.addHook("onSend", (_request, reply, _payload, done) => {
    reply.header("Timing-Allow-Origin", opts.config.ORIGIN);

    done();
  });

  done();
}

export default timingHeader;
