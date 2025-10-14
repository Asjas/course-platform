import { fastifyAutoload } from "@fastify/autoload";
import Fastify, { type FastifyServerOptions } from "fastify";
import fastifyPrintRoutes from "fastify-print-routes";
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { join } from "path";
import type { Config } from "~/config.js";
import { pinoLogger } from "~/lib/logging.js";

/**
 * Creates and configures the Fastify server instance.
 * @param config - Server configuration object.
 * @returns Configured Fastify instance.
 */
async function createServer(config: Config) {
  const opts: FastifyServerOptions = {
    trustProxy: true,
    disableRequestLogging: true,
    loggerInstance: pinoLogger,
    routerOptions: {
      maxParamLength: 5000,
    },
  };

  const server = Fastify(opts).withTypeProvider<ZodTypeProvider>();

  server.decorate("config", config);
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  await server.register(fastifyPrintRoutes);

  await server.register(fastifyAutoload, {
    dir: join(import.meta.dirname, "plugins", "external"),
    options: { prefix: "/status" },
    encapsulate: false,
  });

  await server.register(fastifyAutoload, {
    dir: join(import.meta.dirname, "plugins", "app"),
    options: { prefix: "/status" },
    encapsulate: false,
  });

  await server.register(fastifyAutoload, {
    dir: join(import.meta.dirname, "routes"),
    options: { prefix: "/api" },
    dirNameRoutePrefix: false,
  });

  server.setNotFoundHandler(
    {
      preHandler: server.rateLimit({ max: 60, timeWindow: "1 hour" }),
    },
    function (_request, reply) {
      throw reply.server.httpErrors.notFound("Resource not found.");
    },
  );

  return server;
}

export default createServer;
