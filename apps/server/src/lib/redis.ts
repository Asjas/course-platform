import { Redis, type RedisOptions } from "ioredis";
import config from "~/config.js";

const redisOptions: RedisOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  enableAutoPipelining: true,
};

export const redis = new Redis(redisOptions);
