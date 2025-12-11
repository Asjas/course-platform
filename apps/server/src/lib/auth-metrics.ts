import prometheus from "prom-client";
import { registry } from "~/lib/metrics.js";

/**
 * Counter for authentication attempts.
 */
export const authAttemptCount = new prometheus.Counter({
  name: "course_platform_auth_attempts_total",
  help: "Total number of authentication attempts",
  labelNames: ["method", "status"],
  registers: [registry],
});

/**
 * Counter for authorization failures (forbidden/unauthorized).
 */
export const authFailureCount = new prometheus.Counter({
  name: "course_platform_auth_failures_total",
  help: "Total number of authorization failures",
  labelNames: ["reason"],
  registers: [registry],
});

/**
 * Histogram for authentication duration.
 */
export const authDuration = new prometheus.Histogram({
  name: "course_platform_auth_duration_seconds",
  help: "Authentication processing duration in seconds",
  labelNames: ["method"],
  registers: [registry],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
});

/**
 * Gauge for active authenticated sessions.
 */
export const activeSessionsGauge = new prometheus.Gauge({
  name: "course_platform_active_sessions",
  help: "Number of active authenticated sessions",
  registers: [registry],
});
