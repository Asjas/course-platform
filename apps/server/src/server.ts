import fastifyNodemailer from "@asjas/fastify-nodemailer";
import fastifyAutoload from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import fastifyEtag from "@fastify/etag";
import fastifyFormBody from "@fastify/formbody";
import fastifyHelmet from "@fastify/helmet";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySensible from "@fastify/sensible";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify, { type FastifyServerOptions } from "fastify";
import { FastifyAllowPlugin } from "fastify-allow";
import fastifyBetterAuth from "fastify-better-auth";
import fastifyFavicon from "fastify-favicon";
import fastifyHealthcheck from "fastify-healthcheck";
import fastifyPrintRoutes from "fastify-print-routes";
import { join } from "path";
import type { Config } from "~/config.js";
import { auth } from "~/lib/auth.server.js";
import { pinoLogger } from "~/lib/logging.js";
import { redis } from "~/lib/redis.js";
import { appRouter } from "~/router/index.js";

/**
 * Creates and configures the Fastify server instance.
 * @param config - Server configuration object.
 * @returns Configured Fastify instance.
 */
async function createServer(config: Config) {
  const opts: FastifyServerOptions = {
    ...config,
    trustProxy: 1,
    disableRequestLogging: config.NODE_ENV === "test",
    loggerInstance: pinoLogger,
    routerOptions: {
      maxParamLength: 5000,
    },
  };

  const server = Fastify(opts);

  try {
    await server.register(fastifyRateLimit, {
      allowList: ["127.0.0.1", "localhost"],
      max: 100,
      redis: redis,
      timeWindow: "1 minute",
      nameSpace: "codewizard-rate-limit-",
      keyGenerator: (request) => {
        const clientIp = request.headers["cf-connecting-ip"];

        if (!clientIp || typeof clientIp !== "string") {
          return request.ip || "unknown";
        }

        return clientIp;
      },
    });

    await server.register(fastifyCors, {
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      credentials: true,
      maxAge: 86400,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
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

    await server.register(fastifyNodemailer.default, {
      host: config.MAIL_HOST,
      port: config.MAIL_PORT,
      secure: false,
      auth: {
        user: config.MAIL_USER,
        pass: config.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      pool: true,
    });

    await server.register(fastifyBetterAuth, { auth });

    await server.register(fastifyAutoload, {
      dir: join(import.meta.dirname, "plugins"),
      options: { ...config },
    });

    await server.register(fastifyTRPCPlugin, {
      prefix: "/trpc",
      trpcOptions: { router: appRouter },
    });

    await server.register(fastifyAutoload, {
      dir: join(import.meta.dirname, "routes"),
      options: { prefix: "/api" },
      dirNameRoutePrefix: false,
    });

    server.setNotFoundHandler(
      {
        preHandler: server.rateLimit({ max: 50, timeWindow: "1 hour" }),
      },
      function (_request, reply) {
        reply.code(404).send({ 404: "Not found!" });
      },
    );
  } catch (err) {
    server.log.error(err, "Failed to register plugins.");

    throw err;
  }

  return server;
}

export default createServer;
