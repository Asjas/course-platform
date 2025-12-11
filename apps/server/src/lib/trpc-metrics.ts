import prometheus from "prom-client";
import { registry } from "~/lib/metrics.js";

/**
 * Counter for tRPC procedure errors by error code.
 * Used in server.ts onError callback.
 */
export const trpcErrorCount = new prometheus.Counter({
  name: "course_platform_trpc_errors_total",
  help: "Total number of tRPC errors by code",
  labelNames: ["path", "code"],
  registers: [registry],
});
