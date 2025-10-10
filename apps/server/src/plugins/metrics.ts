import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import perfHooks from "perf_hooks";
import prometheus from "prom-client";
import { setInterval } from "timers";

declare module "fastify" {
  interface FastifyRequest {
    startTime?: [number, number];
  }
}

export default function elu(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  const { eventLoopUtilization } = perfHooks.performance;
  const collectDefaultMetrics = prometheus.collectDefaultMetrics;
  let elu1 = eventLoopUtilization();

  collectDefaultMetrics({
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    eventLoopMonitoringPrecision: 10,
  });

  const httpRequestCount = new prometheus.Counter({
    name: "nodejs_http_request_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
  });

  const httpRequestDuration = new prometheus.Histogram({
    name: "nodejs_http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  const memoryUsageMetric = new prometheus.Gauge({
    name: "nodejs_process_memory_bytes",
    help: "Node.js process memory usage in bytes",
    labelNames: ["type"],
  });

  const eluUsageMetric = new prometheus.Summary({
    name: "nodejs_event_loop_utilization",
    help: "Node.js event loop utilization",
    maxAgeSeconds: 60,
    ageBuckets: 5,
  });

  const interval1 = setInterval(() => {
    const memoryUsage = process.memoryUsage();

    for (const [key, value] of Object.entries(memoryUsage)) {
      memoryUsageMetric.set({ type: key }, value);
    }
  }, 5000);

  const interval2 = setInterval(() => {
    const elu2 = eventLoopUtilization();

    eluUsageMetric.observe(eventLoopUtilization(elu2, elu1).utilization);

    elu1 = elu2;
  }, 100);

  fastify.addHook("onClose", function metricsOnClose(_instance, done) {
    clearInterval(interval1);
    clearInterval(interval2);

    done();
  });

  fastify.addHook(
    "onRequest",
    function metricsOnRequest(request, _reply, done) {
      request.startTime = process.hrtime(); // Store start time on request
      done();
    },
  );

  fastify.addHook(
    "onSend",
    function metricsOnSend(request, reply, payload, done) {
      const route = request.routeOptions.url || request.raw.url || "unknown";
      const method = request.method;
      const status = reply.statusCode.toString();

      httpRequestCount.inc({ method, route, status });

      const diff = process.hrtime(request.startTime);
      const durationInSeconds = diff[0] + diff[1] / 1e9;
      httpRequestDuration.observe({ method, route, status }, durationInSeconds);

      done(null, payload);
    },
  );

  done();
}
