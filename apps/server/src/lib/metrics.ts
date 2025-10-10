import os from "node:os";
import perfHooks from "node:perf_hooks";
import prometheus from "prom-client";
import { pool } from "~/db/index.js";

const { eventLoopUtilization } = perfHooks.performance;

export const registry = new prometheus.Registry();

registry.setDefaultLabels({
  app: "course_platform",
  instance: `${os.hostname()}:${process.pid}`,
});

prometheus.collectDefaultMetrics({
  register: registry,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  eventLoopMonitoringPrecision: 10,
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
    this.set(pool.totalCount);
  },
});

export const databaseConnectionsIdleGauge = new prometheus.Gauge({
  name: "nodejs_database_connections_idle",
  help: "Number of idle database connections in the pool",
  registers: [registry],
  collect: function () {
    this.set(pool.idleCount);
  },
});

export const databaseConnectionsWaitingGauge = new prometheus.Gauge({
  name: "nodejs_database_connections_waiting",
  help: "Number of queries waiting for a database connection",
  registers: [registry],
  collect: function () {
    this.set(pool.waitingCount);
  },
});

export const databaseConnectionsMaxGauge = new prometheus.Gauge({
  name: "nodejs_database_connections_max",
  help: "Maximum number of database connections allowed in the pool",
  registers: [registry],
  collect: function () {
    this.set(pool.options.max);
  },
});

export const databaseConnectionsActiveGauge = new prometheus.Gauge({
  name: "nodejs_database_connections_active",
  help: "Number of active database connections in the pool",
  registers: [registry],
  collect: function () {
    this.set(pool.totalCount - pool.idleCount);
  },
});

export const nodejsProcessMemoryGauge = new prometheus.Gauge({
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

export const eventLoopUtilizationGauge = new prometheus.Gauge({
  name: "nodejs_event_loop_utilization_percent",
  help: "Node.js event loop utilization in percent",
  registers: [registry],
  collect: function eluCollect() {
    const elu = eventLoopUtilization();

    this.set(elu.utilization * 100);
  },
});
