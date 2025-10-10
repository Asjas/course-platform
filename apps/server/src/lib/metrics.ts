import os from "node:os";
import prometheus from "prom-client";
import { pool } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

export const registry = new prometheus.Registry();

registry.setDefaultLabels({
  app: "course_platform",
  instance: `${os.hostname()}:${process.pid}`,
});

prometheus.collectDefaultMetrics({
  register: registry,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

export const httpRequestCount = new prometheus.Counter({
  name: "nodejs_http_request_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [registry],
});

export const httpRequestDuration = new prometheus.Histogram({
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

export const databaseConnectionsTotalGauge = new prometheus.Gauge({
  name: "nodejs_database_connections_total",
  help: "Total number of database connections in the pool",
  registers: [registry],
  collect: function () {
    try {
      this.set(pool.totalCount);
    } catch (error) {
      if (error instanceof Error) {
        pinoLogger.error(error.message);
      }
    }
  },
});

export const databaseConnectionsIdleGauge = new prometheus.Gauge({
  name: "nodejs_database_connections_idle",
  help: "Number of idle database connections in the pool",
  registers: [registry],
  collect: function () {
    try {
      this.set(pool.idleCount);
    } catch (error) {
      if (error instanceof Error) {
        pinoLogger.error(error.message);
      }
    }
  },
});

export const databaseConnectionsWaitingGauge = new prometheus.Gauge({
  name: "nodejs_database_connections_waiting",
  help: "Number of queries waiting for a database connection",
  registers: [registry],
  collect: function () {
    try {
      this.set(pool.waitingCount);
    } catch (error) {
      if (error instanceof Error) {
        pinoLogger.error(error.message);
      }
    }
  },
});

export const databaseConnectionsMaxGauge = new prometheus.Gauge({
  name: "nodejs_database_connections_max",
  help: "Maximum number of database connections allowed in the pool",
  registers: [registry],
  collect: function () {
    try {
      this.set(pool.options.max);
    } catch (error) {
      if (error instanceof Error) {
        pinoLogger.error(error.message);
      }
    }
  },
});

export const databaseConnectionsActiveGauge = new prometheus.Gauge({
  name: "nodejs_database_connections_active",
  help: "Number of active database connections in the pool",
  registers: [registry],
  collect: function () {
    try {
      this.set(pool.totalCount - pool.idleCount);
    } catch (error) {
      if (error instanceof Error) {
        pinoLogger.error(error.message);
      }
    }
  },
});

export const memoryUsageGauge = new prometheus.Gauge({
  name: "nodejs_process_memory_bytes",
  help: "Node.js process memory usage in bytes",
  labelNames: ["type"],
  registers: [registry],
});

export const eventLoopUtilizationGauge = new prometheus.Gauge({
  name: "nodejs_eventloop_utilization_percent",
  help: "Node.js event loop utilization in percent over last 100ms",
  registers: [registry],
});

export const eventLoopIdleGauge = new prometheus.Gauge({
  name: "nodejs_eventloop_idle_ms",
  help: "Node.js event loop idle time in ms over last 100ms",
  registers: [registry],
});

export const eventLoopActiveGauge = new prometheus.Gauge({
  name: "nodejs_eventloop_active_ms",
  help: "Node.js event loop active time in ms over last 100ms",
  registers: [registry],
});
