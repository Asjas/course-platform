import config from "../config.ts";
import { Redis, type RedisOptions } from "ioredis";

const redisOptions: RedisOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  enableAutoPipelining: true,
};

export const redis = new Redis(redisOptions);
