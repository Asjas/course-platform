import type { Config } from "./config.ts";
import { createContext } from "./context.ts";
import {
  FIFTEEN_SECONDS,
  ONE_MINUTE,
  TEN_MB,
  TEN_SECONDS,
  TWO_MINUTES,
} from "./lib/constants.ts";
import { pinoLogger } from "./lib/logging.ts";
import { type AppRouter, appRouter } from "./routers/index.ts";
import { fastifyAutoload } from "@fastify/autoload";
import {
  type FastifyTRPCPluginOptions,
  fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import Fastify, { type FastifyHttpOptions } from "fastify";
import fastifyPrintRoutes from "fastify-print-routes";
import {
  type ZodTypeProvider,
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import type http from "node:http";
import { join } from "path";

/**
 * Creates and configures the Fastify server instance.
 * @param config - Server configuration object.
 * @returns Configured Fastify instance.
 */
async function createServer(config: Config) {
  const opts: FastifyHttpOptions<http.Server> = {
    trustProxy: true,
    disableRequestLogging: true,
    loggerInstance: pinoLogger,
    connectionTimeout: TWO_MINUTES,
    requestTimeout: ONE_MINUTE,
    keepAliveTimeout: TEN_SECONDS,
    bodyLimit: TEN_MB,
    routerOptions: {
      ignoreTrailingSlash: true,
      maxParamLength: 5000,
    },
    http: {
      headersTimeout: FIFTEEN_SECONDS,
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

  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        console.error(`Error in tRPC handler on path '${path}':`, error);
      },
      responseMeta: (opts) => {
        const { errors } = opts;

        if (errors.length) {
          return {
            message: "Internal server error",
            status: 500,
          };
        }

        return {
          headers: new Headers([
            ["cache-control", "no-store, no-cache, must-revalidate, private"],
            ["Pragma", "no-cache"],
            ["Expires", "0"],
          ]),
        };
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
