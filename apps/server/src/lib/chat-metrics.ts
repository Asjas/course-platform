import prometheus from "prom-client";
import { registry } from "~/lib/metrics.js";

/**
 * Gauge for active chat subscriptions.
 */
export const activeChatSubscriptions = new prometheus.Gauge({
  name: "course_platform_chat_active_subscriptions",
  help: "Number of active chat subscriptions",
  labelNames: ["channel"],
  registers: [registry],
});

/**
 * Counter for chat messages sent.
 */
export const chatMessageCount = new prometheus.Counter({
  name: "course_platform_chat_messages_total",
  help: "Total number of chat messages",
  labelNames: ["channel", "action"],
  registers: [registry],
});

/**
 * Histogram for chat message delivery latency.
 */
export const chatDeliveryLatency = new prometheus.Histogram({
  name: "course_platform_chat_delivery_latency_seconds",
  help: "Chat message delivery latency in seconds",
  labelNames: ["channel"],
  registers: [registry],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
});

/**
 * Counter for Redis stream operations.
 */
export const redisStreamOperations = new prometheus.Counter({
  name: "course_platform_redis_stream_operations_total",
  help: "Total Redis stream operations",
  labelNames: ["operation", "status"],
  registers: [registry],
});
