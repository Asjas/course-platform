import envSchema from "env-schema";
import { S } from "fluent-json-schema";

const schema = S.object()
  .prop("PORT", S.number().required())
  .prop("NODE_ENV", S.string().default("development"))
  .prop("LOG_LEVEL", S.string().default("info"))
  .prop("DATABASE_URL", S.string())
  .prop("COOKIE_SECRET", S.string())
  .prop("BETTER_AUTH_SECRET", S.string())
  .prop("PEPPER_SECRET", S.string())
  .prop("MAIL_HOST", S.string())
  .prop("MAIL_PORT", S.number())
  .prop("MAIL_USER", S.string())
  .prop("MAIL_PASS", S.string())
  .prop("POLAR_ACCESS_TOKEN", S.string())
  .prop("POLAR_SUCCESS_URL", S.string())
  .valueOf();

export type Config = {
  logger: boolean;
  PORT: number;
  NODE_ENV: string;
  LOG_LEVEL: string;
  PRETTY_PRINT: boolean;
  DATABASE_URL: string;
  COOKIE_SECRET: string;
  BETTER_AUTH_SECRET: string;
  PEPPER_SECRET: string;
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASS: string;
  POLAR_ACCESS_TOKEN: string;
  POLAR_SUCCESS_URL: string;
};

export default envSchema({
  schema,
  dotenv: true,
}) as Config;
