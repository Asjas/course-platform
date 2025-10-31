import { redis } from "../../lib/redis.ts";
import fastifyRateLimit, {
  type FastifyRateLimitOptions,
} from "@fastify/rate-limit";
import type { FastifyInstance, FastifyRequest } from "fastify";

export const autoConfig = (
  fastify: FastifyInstance,
): FastifyRateLimitOptions => {
  return {
    allowList: [fastify.config.ORIGIN],
    max: 500,
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
