import {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";

export default function timingHeader(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.addHook("onSend", (_request, reply, _payload, done) => {
    reply.header("Timing-Allow-Origin", "https://codewizard.training");

    done();
  });

  done();
}
