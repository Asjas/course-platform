import prometheus from "prom-client";
import { registry } from "~/lib/metrics.js";

/**
 * Counter for total tRPC procedure calls.
 */
export const trpcProcedureCount = new prometheus.Counter({
  name: "course_platform_trpc_procedure_total",
  help: "Total number of tRPC procedure calls",
  labelNames: ["path", "type", "status"],
  registers: [registry],
});

/**
 * Histogram for tRPC procedure duration in seconds.
 */
export const trpcProcedureDuration = new prometheus.Histogram({
  name: "course_platform_trpc_procedure_duration_seconds",
  help: "tRPC procedure duration in seconds",
  labelNames: ["path", "type"],
  registers: [registry],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
});

/**
 * Counter for tRPC procedure errors by error code.
 */
export const trpcErrorCount = new prometheus.Counter({
  name: "course_platform_trpc_errors_total",
  help: "Total number of tRPC errors by code",
  labelNames: ["path", "code"],
  registers: [registry],
});
