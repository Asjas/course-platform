import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import perfHooks from "perf_hooks";
import prometheus from "prom-client";
import { setInterval } from "timers";

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
    prefix: "nodejs_",
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
    labelNames: ["idle", "active", "utilization"],
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

  fastify.addHook("onClose", () => {
    clearInterval(interval1);
    clearInterval(interval2);
  });

  done();
}
