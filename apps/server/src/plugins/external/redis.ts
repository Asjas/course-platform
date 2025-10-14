import fastifyRateLimit from "@fastify/rate-limit";
import fastifyRedis from "@fastify/redis";
import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";
import { redis } from "~/lib/redis.js";

export default function redisPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.register(fastifyRedis, {
    client: redis,
  });

  fastify.register(fastifyRateLimit, {
    allowList: [fastify.config.ORIGIN],
    max: 100,
    redis: fastify.redis,
    timeWindow: "1 minute",
    nameSpace: "codewizard-rate-limit-",
    keyGenerator: (request: FastifyRequest) => {
      return (
        (request.headers["cf-connecting-ip"] as string) ||
        request.ip ||
        "unknown"
      );
    },
  });

  done();
}
