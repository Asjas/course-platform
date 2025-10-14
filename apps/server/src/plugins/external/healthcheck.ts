import type { FastifyInstance } from "fastify";
import fastifyHealthcheck, {
  type FastifyHealthcheckOptions,
} from "fastify-healthcheck";
import * as z from "zod";

const HEALTH_CHECK_200_RESPONSE_SCHEMA = z.object({
  statusCode: z.literal(200),
  status: z.literal("ok"),
});

const HEALTH_CHECK_500_RESPONSE_SCHEMA = z.object({
  statusCode: z.literal(500),
  status: z.literal("ko"),
});

export const autoConfig = (
  fastify: FastifyInstance,
): FastifyHealthcheckOptions => {
  return {
    schemaOptions: {
      response: {
        200: HEALTH_CHECK_200_RESPONSE_SCHEMA,
        500: HEALTH_CHECK_500_RESPONSE_SCHEMA,
      },
    },
    underPressureOptions: {
      maxEventLoopDelay: 1000,
      maxEventLoopUtilization: 0.98,
      maxHeapUsedBytes: fastify.config.MAX_HEAP_USED_BYTES,
      maxRssBytes: fastify.config.MAX_RSS_BYTES,
    },
  };
};

export default fastifyHealthcheck;
