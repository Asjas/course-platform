import * as z from "zod";

const schema = z.object({
  // Application variables
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  HOST: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  ORIGIN: z.url(),
  COOKIE_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.url(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_DSN: z.url().optional(),

  // Authentication variables
  BETTER_AUTH_SECRET: z.string().min(32),
  PEPPER_SECRET: z.string().min(32),

  // Email variables
  SMTP_HOST: z.string().nonempty(),
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
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Payment variables
  POLAR_ACCESS_TOKEN: z.string().nonempty(),
  POLAR_SUCCESS_URL: z.string().url(),
  LEARN_FASTIFY_POLAR_PRODUCT_ID: z.string().uuid(),

  // Prometheus variables
  PROMETHEUS_HOST: z.string().default("localhost"),
  PROMETHEUS_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default(9092),
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
});

export type Config = z.infer<typeof schema>;

export default schema.parse(process.env) as Config;
