import FastifyNodemailer from "@asjas/fastify-nodemailer";
import FastifyAutoload from "@fastify/autoload";
import FastifyCors from "@fastify/cors";
import FastifyEtag from "@fastify/etag";
import FastifyFormBody from "@fastify/formbody";
import FastifyHelmet from "@fastify/helmet";
import FastifyMultipart from "@fastify/multipart";
import FastifyRateLimit from "@fastify/rate-limit";
import FastifySensible from "@fastify/sensible";
import Fastify, { FastifyServerOptions } from "fastify";
import FastifyAllow from "fastify-allow";
import FastifyFavicon from "fastify-favicon";
import FastifyHealthcheck from "fastify-healthcheck";
import FastifyIP from "fastify-ip";
import { join } from "path";
import type { Config } from "~/config";
import { redis } from "~/lib/redis";

async function createServer(config: Config) {
  const opts: FastifyServerOptions = {
    ...config,
    logger: {
      level: config.LOG_LEVEL,
    },
  };

  const server = Fastify(opts);

  await server.register(FastifyIP);

  await server.register(FastifyRateLimit, {
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

  await server.register(FastifyCors, {
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  });

  await server.register(FastifyEtag);

  await server.register(FastifyHelmet);

  await server.register(FastifyAllow);

  await server.register(FastifyHealthcheck);

  await server.register(FastifyFormBody);

  await server.register(FastifyMultipart, { attachFieldsToBody: true });

  await server.register(FastifyFavicon);

  await server.register(FastifySensible);

  await server.register(FastifyNodemailer, {
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

  await server.register(FastifyAutoload, {
    dir: join(import.meta.dirname, "plugins"),
    options: {
      ...opts,
    },
  });

  await server.register(FastifyAutoload, {
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

  return server;
}

export default createServer;
