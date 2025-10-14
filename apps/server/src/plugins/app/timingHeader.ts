import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";

export default function timingHeaderPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.addHook(
    "onSend",
    function timingHeaderOnSend(_request, reply, _payload, done) {
      reply.header("Timing-Allow-Origin", fastify.config.ORIGIN);

      done();
    },
  );

  done();
}
