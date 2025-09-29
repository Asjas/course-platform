import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import fastifyPlugin from "fastify-plugin";
import type { Config } from "~/config.js";

function timingHeader(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & Config,
  done: HookHandlerDoneFunction,
) {
  fastify.addHook("onSend", (_request, reply, _payload, done) => {
    reply.header("Timing-Allow-Origin", opts.ORIGIN);

    done();
  });

  done();
}

export default fastifyPlugin(timingHeader);
