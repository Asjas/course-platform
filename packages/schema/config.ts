import { prefixedUlid } from "./base/prefixed-ulid.js";
import * as z from "zod";

const schema = z.object({
  // Application variables
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  HOST: z.hostname(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  ORIGIN: z.url(),
  COOKIE_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_DSN: z.httpUrl().optional(),
  MAX_HEAP_USED_BYTES: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0))
    .default(0),
  MAX_RSS_BYTES: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0))
    .default(0),

  // Authentication variables
  BETTER_AUTH_SECRET: z.string().min(32),
  PEPPER_SECRET: z.string().min(32),

  // Email variables
  SMTP_HOST: z.hostname().nonempty(),
  SMTP_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  SMTP_USER: z.email(),
  SMTP_PASS: z.string().nonempty(),
  SMTP_SECURE: z
    .string()
    .transform((val) => Boolean(val))
    .default(false),

  // Database variables
  DATABASE_URL: z.url().regex(/^postgres:/, "Must be a PostgreSQL URL"),
  REDIS_HOST: z.hostname().default("localhost"),
  REDIS_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Payment variables
  POLAR_ACCESS_TOKEN: z.string().nonempty(),
  POLAR_SUCCESS_URL: z.url(),
  LEARN_FASTIFY_POLAR_PRODUCT_ID: z.uuid(),

  // Prometheus variables
  PROMETHEUS_HOST: z.hostname().default("localhost"),
  PROMETHEUS_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default(9092),

  // R2 Images
  R2_ACCESS_KEY_ID: z.string().nonempty(),
  R2_SECRET_ACCESS_KEY: z.string().nonempty(),
  R2_BUCKET_NAME: z.string().nonempty(),
  R2_ENDPOINT: z.url(),
  R2_PUBLIC_URL: z.url(),

  // Support Ticket variables
  SUPPORT_ASSIGNED_TO_USER_ID: prefixedUlid,
});

export type Config = z.infer<typeof schema>;

export default schema.parse(process.env) as Config;
