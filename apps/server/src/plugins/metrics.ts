import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import prometheus from "prom-client";
import {
  httpRequestCount,
  httpRequestDuration,
  registry,
} from "~/lib/metrics.js";
import { normalizeRoute } from "~/lib/normalized-route.js";

declare module "fastify" {
  interface FastifyInstance {
    prometheus: typeof prometheus;
    prometheusRegistry: typeof registry;
  }
  interface FastifyRequest {
    startTime: bigint;
  }
}

export default function metricsPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.decorate("prometheus", prometheus);
  fastify.decorate("prometheusRegistry", registry);

  fastify.addHook(
    "onRequest",
    function metricsOnRequest(request, _reply, done) {
      request.startTime = process.hrtime.bigint();

      done();
    },
  );

  fastify.addHook(
    "onSend",
    function metricsOnSend(request, reply, _payload, done) {
      const duration =
        Number(process.hrtime.bigint() - request.startTime) / 1e9;

      httpRequestCount.inc({
        method: request.method,
        status: reply.statusCode,
        route: normalizeRoute(request.routeOptions.url),
      });

      httpRequestDuration.observe(
        {
          method: request.method,
          status: reply.statusCode,
          route: normalizeRoute(request.routeOptions.url),
        },
        duration,
      );

      done();
    },
  );

  done();
}
