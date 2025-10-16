import { createCache } from "async-cache-dedupe";
import { deserialize, serialize } from "superjson";
import { redis } from "~/lib/redis.js";

export const cache = createCache({
  storage: { type: "redis", options: { client: redis } },
  transformer: {
    serialize: (result) => serialize(result),
    deserialize: (serialized) => deserialize(serialized),
  },
});
