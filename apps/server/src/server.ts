import { fastifyAutoload } from "@fastify/autoload";
import {
  type FastifyTRPCPluginOptions,
  fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
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
import { createContext } from "~/context.js";
import { TEN_MB } from "~/lib/constants.js";
import { pinoLogger } from "~/lib/logging.js";
import { type AppRouter, appRouter } from "~/routers/index.js";

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
    dirNameRoutePrefix: false,
    matchFilter: /index\.(?:ts|js)$/,
  });

  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        // report to error monitoring
        console.error(`Error in tRPC handler on path '${path}':`, error);
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });

  server.setNotFoundHandler(
    {
      preHandler: server.rateLimit({ max: 60, timeWindow: "1 hour" }),
    },
    function (_request, reply) {
      return reply.status(404).send({
        error: "Not Found",
        message: "The requested resource was not found",
      });
    },
  );

  server.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.server.httpErrors.badRequest({
        error: "Validation Error",
        message: "Response doesn't match the schema",
        details: {
          issues: error.validation,
          method: request.method,
          url: request.url,
        },
      });
    }

    return reply.internalServerError();
  });

  return server;
}

export default createServer;
