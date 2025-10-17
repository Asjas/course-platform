import { createCache } from "async-cache-dedupe";
import { deserialize, serialize } from "superjson";
import { ONE_HOUR } from "~/lib/constants.js";
import { pinoLogger } from "~/lib/logging.js";
import {
  cacheErrorCounter,
  cacheHitCounter,
  cacheMissCounter,
} from "~/lib/metrics.js";
import { redis } from "~/lib/redis.js";
import {
  getAllSupportTickets,
  getSupportTicketById,
} from "~/routes/support-tickets/queries.js";
import { getAllUsers, getUserById } from "~/routes/users/queries.js";

export const cache = createCache({
  storage: {
    type: "redis",
    options: { client: redis, invalidation: { referencesTTL: ONE_HOUR * 2 } },
  },
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
  .define(
    "getAllUsers",
    {
      ttl: ONE_HOUR,
      serialize: () => "all",
      references() {
        return ["user~all"];
      },
    },
    getAllUsers,
  )
  .define(
    "getUserById",
    {
      ttl: ONE_HOUR,
      serialize: (args) => args.userId,
      references(args) {
        return [args.userId];
      },
    },
    getUserById,
  )
  .define(
    "getAllSupportTickets",
    {
      ttl: ONE_HOUR,
      serialize: () => "all",
      references() {
        return ["support-ticket~all"];
      },
    },
    getAllSupportTickets,
  )
  .define(
    "getSupportTicketById",
    {
      ttl: ONE_HOUR,
      serialize: (args) => args.ticketId,
      references(args) {
        return [args.ticketId];
      },
    },
    getSupportTicketById,
  );
