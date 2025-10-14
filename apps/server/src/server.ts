import { fastifyAutoload } from "@fastify/autoload";
import Fastify, { type FastifyServerOptions } from "fastify";
import fastifyPrintRoutes from "fastify-print-routes";
import {
  type ZodTypeProvider,
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { join } from "path";
import type { Config } from "~/config.js";
import { TEN_MB } from "~/lib/constants.js";
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
    bodyLimit: TEN_MB,
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

  server.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      reply.code(400).send({
        error: "Validation Error",
        message: "Response doesn't match the schema",
        statusCode: 400,
        details: {
          issues: error.validation,
          method: request.method,
          url: request.url,
        },
      });

      return;
    }

    reply.code(500).send({ error: "Internal Server Error" });
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
