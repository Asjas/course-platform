import { fastifyAutoload } from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import fastifyEtag from "@fastify/etag";
import fastifyFormBody from "@fastify/formbody";
import fastifyHelmet from "@fastify/helmet";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyRedis from "@fastify/redis";
import fastifySensible from "@fastify/sensible";
import Fastify, { type FastifyServerOptions } from "fastify";
import { FastifyAllowPlugin } from "fastify-allow";
import fastifyBetterAuth from "fastify-better-auth";
import fastifyFavicon from "fastify-favicon";
import fastifyHealthcheck from "fastify-healthcheck";
import fastifyPrintRoutes from "fastify-print-routes";
import { join } from "path";
import prometheus from "prom-client";
import type { Config } from "~/config.js";
import { auth } from "~/lib/auth.server.js";
import { pinoLogger } from "~/lib/logging.js";
import { redis } from "~/lib/redis.js";

/**
 * Creates and configures the Fastify server instance.
 * @param config - Server configuration object.
 * @returns Configured Fastify instance.
 */
async function createServer(config: Config) {
  const opts: FastifyServerOptions = {
    ...config,
    trustProxy: true,
    disableRequestLogging: true,
    loggerInstance: pinoLogger,
    routerOptions: {
      maxParamLength: 5000,
    },
  };

  const server = Fastify(opts);

  server.addHook("onRequest", (request, _reply, done) => {
    server.log.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        host: request.hostname,
        remoteAddress: request.headers["cf-connecting-ip"] || request.ip,
        remotePort: request.raw.socket.remotePort,
      },
      "incoming request",
    );

    done();
  });

  server.addHook("onResponse", (request, reply, done) => {
    server.log.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        host: request.hostname,
        remoteAddress: request.headers["cf-connecting-ip"] || request.ip,
        remotePort: request.raw.socket.remotePort,
        statusCode: reply.statusCode,
      },
      "request completed",
    );

    done();
  });

  try {
    await server.register(fastifyRateLimit, {
      allowList: ["127.0.0.1", "localhost"],
      max: 100,
      redis: redis,
      timeWindow: "1 minute",
      nameSpace: "codewizard-rate-limit-",
      keyGenerator: (request) => {
        return (
          (request.headers["cf-connecting-ip"] as string) ||
          request.ip ||
          "unknown"
        );
      },
    });

    await server.register(fastifyCors, {
      credentials: true,
      maxAge: 86400,
      origin: config.ORIGIN,
    });

    await server.register(fastifyEtag);

    await server.register(fastifyHelmet);

    await server.register(FastifyAllowPlugin);

    await server.register(fastifyHealthcheck);

    await server.register(fastifyFormBody);

    await server.register(fastifyMultipart, { attachFieldsToBody: true });

    await server.register(fastifyFavicon);

    await server.register(fastifySensible);

    await server.register(fastifyPrintRoutes);

    await server.register(fastifyBetterAuth, { auth });

    await server.register(fastifyRedis, {
      client: redis,
    });

    await server.register(fastifyAutoload, {
      dir: join(import.meta.dirname, "plugins"),
      options: { config },
      encapsulate: false,
    });

    await server.register(fastifyAutoload, {
      dir: join(import.meta.dirname, "routes"),
      options: { prefix: "/api" },
      dirNameRoutePrefix: false,
    });

    server.get("/metrics", async () => {
      const metrics = await prometheus.register.metrics();

      return metrics;
    });
  } catch (err) {
    server.log.error(err, "Failed to register plugins.");

    throw err;
  }

  server.setNotFoundHandler(
    {
      preHandler: server.rateLimit({ max: 60, timeWindow: "1 hour" }),
    },
    function (_request, reply) {
      throw reply.server.httpErrors.notFound("Resource not found.");
    },
  );

  server.setErrorHandler(function (error, request, reply) {
    request.log.error({ err: error, reqId: request.id }, "request errored out");

    if (reply.statusCode >= 500) {
      reply.send(
        request.server.httpErrors.internalServerError(
          "Something went wrong on the server.",
        ),
      );
    } else if (reply.statusCode === 429) {
      reply.send(
        request.server.httpErrors.tooManyRequests(
          "Too many requests, please try again later.",
        ),
      );
    } else if (reply.statusCode === 401) {
      reply.send(
        request.server.httpErrors.unauthorized("Unauthorized access."),
      );
    } else if (reply.statusCode === 403) {
      reply.send(request.server.httpErrors.forbidden("Access forbidden."));
    } else if (reply.statusCode === 404) {
      reply.send(request.server.httpErrors.notFound("Resource not found."));
    } else {
      reply.send(
        request.server.httpErrors.badRequest(error.message || "Bad request."),
      );
    }
  });

  return server;
}

export default createServer;
