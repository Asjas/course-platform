import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";

/**
 * Plugin for logging incoming requests and responses.
 * Logs request details on incoming requests and response status on completion.
 */
export default function requestLoggingPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.addHook("onRequest", (request, _reply, done) => {
    fastify.log.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        host: request.hostname,
        remoteAddress: request.headers["cf-connecting-ip"] || request.ip,
        remotePort: request.raw.socket.remotePort,
      },
      "incoming request",
    );

    done();
  });

  fastify.addHook("onResponse", (request, reply, done) => {
    fastify.log.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        host: request.hostname,
        remoteAddress: request.headers["cf-connecting-ip"] || request.ip,
        remotePort: request.raw.socket.remotePort,
        statusCode: reply.statusCode,
      },
      "request completed",
    );

    done();
  });

  done();
}
