import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import { performance } from "node:perf_hooks";
import prometheus from "prom-client";
import {
  eventLoopActiveGauge,
  eventLoopIdleGauge,
  eventLoopUtilizationGauge,
  httpRequestCount,
  httpRequestDuration,
  memoryUsageGauge,
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
    normalizedRoute: string;
  }
}

export default function metricsPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.decorate("prometheus", prometheus);
  fastify.decorate("prometheusRegistry", registry);

  fastify.decorateRequest("startTime", 0n);
  fastify.decorateRequest("normalizedRoute", "");

  fastify.addHook(
    "onRequest",
    function metricsOnRequest(request, _reply, done) {
      request.startTime = process.hrtime.bigint();
      request.normalizedRoute = normalizeRoute(request.routeOptions.url);

      done();
    },
  );

  fastify.addHook(
    "onResponse",
    function metricsOnResponse(request, reply, done) {
      try {
        const duration =
          Number(process.hrtime.bigint() - request.startTime) / 1e9;

        httpRequestCount.inc({
          method: request.method,
          status: reply.statusCode,
          route: request.normalizedRoute,
        });

        httpRequestDuration.observe(
          {
            method: request.method,
            status: reply.statusCode,
            route: request.normalizedRoute,
          },
          duration,
        );
      } catch (error) {
        if (error instanceof Error) {
          fastify.log.error(error.message);
        }
      }

      done();
    },
  );

  fastify.addHook(
    "onError",
    function metricsOnError(request, _reply, error, done) {
      try {
        const duration =
          Number(process.hrtime.bigint() - request.startTime) / 1e9;

        httpRequestDuration.observe(
          {
            method: request.method,
            status: error.statusCode || 500,
            route:
              request.normalizedRoute ||
              normalizeRoute(request.routeOptions.url),
          },
          duration,
        );
      } catch (error) {
        if (error instanceof Error) {
          fastify.log.error(error.message);
        }
      }

      done();
    },
  );

  // Measure event loop utilization, idle and active time
  let prevElu = performance.eventLoopUtilization();

  const timer = setInterval(() => {
    const elu = performance.eventLoopUtilization(prevElu);

    eventLoopUtilizationGauge.set(elu.utilization * 100);
    eventLoopIdleGauge.set(elu.idle);
    eventLoopActiveGauge.set(elu.active);

    // Update snapshot for next interval
    prevElu = performance.eventLoopUtilization();
  }, 100).unref();

  setInterval(() => {
    const mem = process.memoryUsage();

    memoryUsageGauge.set({ type: "rss" }, mem.rss);
    memoryUsageGauge.set({ type: "heap_total" }, mem.heapTotal);
    memoryUsageGauge.set({ type: "heap_used" }, mem.heapUsed);
    memoryUsageGauge.set({ type: "array_buffers" }, mem.arrayBuffers);
    memoryUsageGauge.set({ type: "external" }, mem.external);
  }, 1000).unref();

  fastify.addHook("onClose", function metricsOnClose() {
    clearInterval(timer);
  });

  done();
}
