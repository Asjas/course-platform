import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import os from "node:os";
import perfHooks from "node:perf_hooks";
import prometheus from "prom-client";
import { pool } from "~/db/index.js";

declare module "fastify" {
  interface FastifyInstance {
    prometheus: typeof prometheus;
    prometheusRegistry: typeof registry;
  }
  interface FastifyRequest {
    startTime: bigint;
  }
}

const registry = new prometheus.Registry();

registry.setDefaultLabels({
  app: "course_platform",
  instance: `${os.hostname()}:${process.pid}`,
});

export default function metricsPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  const { eventLoopUtilization } = perfHooks.performance;

  fastify.decorate("prometheus", prometheus);
  fastify.decorate("prometheusRegistry", registry);

  prometheus.collectDefaultMetrics({
    register: registry,
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    eventLoopMonitoringPrecision: 10,
  });

  const httpRequestCount = new prometheus.Counter({
    name: "nodejs_http_request_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
    registers: [registry],
  });

  const httpRequestDuration = new prometheus.Histogram({
    name: "nodejs_http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status"],
    registers: [registry],
    buckets: [
      // Very fast requests
      0.001,
      0.005,
      0.01,
      // Typical web requests
      0.025,
      0.05,
      0.1,
      0.25,
      0.5,
      // Slow requests
      1,
      2,
      5,
      // Very slow / timeout
      10,
      30,
      Infinity,
    ],
  });

  new prometheus.Gauge({
    name: "database_connections_total",
    help: "Total number of database connections in the pool",
    labelNames: ["pool"],
    registers: [registry],
    collect: function () {
      this.set({ pool: "main" }, pool.totalCount);
    },
  });

  new prometheus.Gauge({
    name: "database_connections_idle",
    help: "Number of idle database connections in the pool",
    labelNames: ["pool"],
    registers: [registry],
    collect: function () {
      this.set({ pool: "main" }, pool.idleCount);
    },
  });

  new prometheus.Gauge({
    name: "database_connections_waiting",
    help: "Number of queries waiting for a database connection",
    labelNames: ["pool"],
    registers: [registry],
    collect: function () {
      this.set({ pool: "main" }, pool.waitingCount);
    },
  });

  new prometheus.Gauge({
    name: "database_connections_max",
    help: "Maximum number of database connections allowed in the pool",
    labelNames: ["pool"],
    registers: [registry],
    collect: function () {
      this.set({ pool: "main" }, pool.options.max);
    },
  });

  new prometheus.Gauge({
    name: "database_connections_active",
    help: "Number of active database connections in the pool",
    labelNames: ["pool"],
    registers: [registry],
    collect: function () {
      this.set({ pool: "main" }, pool.totalCount - pool.idleCount);
    },
  });

  new prometheus.Gauge({
    name: "nodejs_process_memory_bytes",
    help: "Node.js process memory usage in bytes",
    labelNames: ["type"],
    registers: [registry],
    collect: function memoryCollect() {
      const memoryUsage = process.memoryUsage();

      for (const [key, value] of Object.entries(memoryUsage)) {
        this.set({ type: key }, value);
      }
    },
  });

  new prometheus.Gauge({
    name: "nodejs_event_loop_utilization_percent",
    help: "Node.js event loop utilization in percent",
    registers: [registry],
    collect: function eluCollect() {
      const elu = eventLoopUtilization();

      this.set(elu.utilization * 100);
    },
  });

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
        { method: request.method, status: reply.statusCode },
        duration,
      );

      done();
    },
  );

  done();
}

const routeBuckets = new Map<string, string>([
  ["/api/metrics", "metrics"],
  ["/api/auth", "auth_api"],
  ["/api/coupons", "coupons_api"],
  ["/api/courses", "courses_api"],
  ["/api/orders", "orders_api"],
  ["/api/users", "users_api"],
  ["/api/sessions", "sessions_api"],
  ["/api/support-tickets", "support_tickets_api"],
  ["/api/team-licenses", "team_licenses_api"],
  ["/api/platform-announcements", "platform_announcements_api"],
]);

// Normalize routes to avoid high cardinality
function normalizeRoute(routeUrl: string | undefined): string {
  if (!routeUrl) return "unknown";

  // Replace route parameters
  const normalizedRoute = routeUrl
    .replace(/:\w+/g, "*") // Handle :param
    .replace(/\/\d+/g, "/*"); // Handle /123

  // Check for direct match (e.g., /api/users/* or /api/metrics)
  if (routeBuckets.has(normalizedRoute)) {
    return routeBuckets.get(normalizedRoute) || "unknown";
  }

  // Try the base route by removing trailing /* if present
  const baseRoute = normalizedRoute.endsWith("/*")
    ? normalizedRoute.slice(0, -2)
    : normalizedRoute;

  if (routeBuckets.has(baseRoute)) {
    return routeBuckets.get(baseRoute) || "unknown";
  }

  // Fallback to normalized route
  return normalizedRoute;
}
