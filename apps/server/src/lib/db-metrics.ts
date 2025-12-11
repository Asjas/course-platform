import prometheus from "prom-client";
import { registry } from "~/lib/metrics.js";

/**
 * Histogram for database query duration.
 */
export const dbQueryDuration = new prometheus.Histogram({
  name: "course_platform_db_query_duration_seconds",
  help: "Database query duration in seconds",
  labelNames: ["operation", "table"],
  registers: [registry],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

/**
 * Counter for database queries.
 */
export const dbQueryCount = new prometheus.Counter({
  name: "course_platform_db_queries_total",
  help: "Total number of database queries",
  labelNames: ["operation", "table", "status"],
  registers: [registry],
});

/**
 * Counter for database errors.
 */
export const dbErrorCount = new prometheus.Counter({
  name: "course_platform_db_errors_total",
  help: "Total number of database errors",
  labelNames: ["operation", "table", "error_type"],
  registers: [registry],
});

/**
 * Histogram for transaction duration.
 */
export const dbTransactionDuration = new prometheus.Histogram({
  name: "course_platform_db_transaction_duration_seconds",
  help: "Database transaction duration in seconds",
  labelNames: ["status"],
  registers: [registry],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
});
