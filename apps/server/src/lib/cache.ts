import { createCache } from "async-cache-dedupe";
import { deserialize, serialize } from "superjson";
import { pinoLogger } from "~/lib/logging.js";
import {
  cacheErrorCounter,
  cacheHitCounter,
  cacheMissCounter,
} from "~/lib/metrics.js";
import { redis } from "~/lib/redis.js";
import { getAllUsersCache, getUserByIdCache } from "~/routes/users/cache.js";

export const cache = createCache({
  storage: { type: "redis", options: { client: redis, invalidation: true } },
  transformer: {
    serialize: (result) => serialize(result),
    deserialize: (serialized) => deserialize(serialized),
  },
  onHit(key) {
    cacheHitCounter.inc({ key });
  },
  onMiss(key) {
    cacheMissCounter.inc({ key });
  },
  onError(err: unknown) {
    if (err instanceof Error) {
      pinoLogger.error(err, "Cache error");
    }

    cacheErrorCounter.inc({ err: 1 });
  },
})
  .define("getAllUsers", getAllUsersCache)
  .define("getUserById", getUserByIdCache);
