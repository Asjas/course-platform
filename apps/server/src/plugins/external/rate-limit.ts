import fastifyRateLimit, {
  type FastifyRateLimitOptions,
} from "@fastify/rate-limit";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { redis } from "~/lib/redis.js";

// Rate limit: 100 requests per minute per user
// This applies to all HTTP routes including tRPC endpoints
export const autoConfig = (
  fastify: FastifyInstance,
): FastifyRateLimitOptions => {
  return {
    allowList: [fastify.config.ORIGIN],
    max: 100,
    redis: redis,
    timeWindow: "1 minute",
    nameSpace: "codewizard-rate-limit-",
    skipOnError: false,
    keyGenerator: (request: FastifyRequest) => {
      return (
        (request.headers["cf-connecting-ip"] as string) ||
        request.ip ||
        "unknown"
      );
    },
  };
};

export default fastifyRateLimit;
