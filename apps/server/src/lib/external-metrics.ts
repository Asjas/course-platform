import prometheus from "prom-client";
import { registry } from "~/lib/metrics.js";

/**
 * Histogram for external service request duration.
 */
export const externalServiceDuration = new prometheus.Histogram({
  name: "course_platform_external_service_duration_seconds",
  help: "External service request duration in seconds",
  labelNames: ["service", "operation"],
  registers: [registry],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30],
});

/**
 * Counter for external service requests.
 */
export const externalServiceCount = new prometheus.Counter({
  name: "course_platform_external_service_requests_total",
  help: "Total external service requests",
  labelNames: ["service", "operation", "status"],
  registers: [registry],
});

/**
 * Counter for external service errors.
 */
export const externalServiceErrors = new prometheus.Counter({
  name: "course_platform_external_service_errors_total",
  help: "Total external service errors",
  labelNames: ["service", "operation", "error_type"],
  registers: [registry],
});

/**
 * Histogram for file upload size in bytes.
 */
export const fileUploadSize = new prometheus.Histogram({
  name: "course_platform_file_upload_bytes",
  help: "File upload size in bytes",
  labelNames: ["content_type"],
  registers: [registry],
  buckets: [
    1024, // 1 KB
    10240, // 10 KB
    102400, // 100 KB
    1048576, // 1 MB
    5242880, // 5 MB
    10485760, // 10 MB
    52428800, // 50 MB
  ],
});
