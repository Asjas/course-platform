import fastifyNodemailer from "@asjas/fastify-nodemailer";
import fastifyAutoload from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import fastifyEtag from "@fastify/etag";
import fastifyFormBody from "@fastify/formbody";
import fastifyHelmet from "@fastify/helmet";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySensible from "@fastify/sensible";
import Fastify, { FastifyServerOptions } from "fastify";
import { FastifyAllowPlugin } from "fastify-allow";
import fastifyFavicon from "fastify-favicon";
import fastifyHealthcheck from "fastify-healthcheck";
import fastifyIP from "fastify-ip";
import { join } from "path";
import type { Config } from "~/config.js";
import { redis } from "~/lib/redis.js";

/**
 * Creates and configures the Fastify server instance.
 * @param config - Server configuration object.
 * @returns Configured Fastify instance.
 */
async function createServer(config: Config) {
  const opts: FastifyServerOptions = {
    ...config,
    logger: {
      level: config.LOG_LEVEL,
    },
  };

  const server = Fastify(opts);

  try {
    await server.register(fastifyIP.default, {
      order: ["x-forwarded-for", "x-real-ip", "x-client-ip"], // Custom header priority
      strict: false, // Allow fallbacks
      isAWS: false, // Not using AWS-specific inference
    });

    await server.register(fastifyRateLimit, {
      allowList: config.NODE_ENV === "development" ? ["127.0.0.1"] : [],
      max: 100,
      redis: redis,
      timeWindow: "1 minute",
      nameSpace: "codewizard-rate-limit-",
      onBanReach: function (req, key) {
        console.log("callback on ban");
      },
      onExceeding: function (req, key) {
        console.log("callback on exceeding");
      },
      onExceeded: function (req, key) {
        console.log("callback on exceeded");
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

    await server.register(fastifyAutoload, {
      dir: join(import.meta.dirname, "plugins"),
      options: {
        ...opts,
      },
    });

    await server.register(fastifyAutoload, {
      dir: join(import.meta.dirname, "routes"),
      dirNameRoutePrefix: true,
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
