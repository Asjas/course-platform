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
  getAllCoupons,
  getCouponByCode,
  getCouponById,
} from "~/routers/coupons/queries.js";
import { getModulesAndLessonsByCourseId } from "~/routers/courses/queries.js";
import {
  getAllSupportTickets,
  getSupportTicketById,
  getSupportTicketCommentById,
} from "~/routers/support-tickets/queries.js";

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
  onError(err) {
    if (err instanceof Error) {
      pinoLogger.error(err, "Cache error");
    }

    cacheErrorCounter.inc({ err: 1 });
  },
})
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
        return [`support-ticket~id~${args.ticketId}`];
      },
    },
    getSupportTicketById,
  )
  .define(
    "getSupportTicketCommentById",
    {
      ttl: ONE_HOUR,
      serialize: (args) => args.commentId,
      references(args) {
        return [`support-ticket-comment~id~${args.commentId}`];
      },
    },
    getSupportTicketCommentById,
  )
  .define(
    "getAllCoupons",
    {
      ttl: ONE_HOUR,
      serialize: () => "all",
      references() {
        return ["coupon~all"];
      },
    },
    getAllCoupons,
  )
  .define(
    "getCouponById",
    {
      ttl: ONE_HOUR,
      serialize: (args) => args.couponId,
      references(args) {
        return [`coupon~id~${args.couponId}`];
      },
    },
    getCouponById,
  )
  .define(
    "getCouponByCode",
    {
      ttl: ONE_HOUR,
      serialize: (args) => args.couponCode,
      references(args) {
        return [`coupon~code~${args.couponCode}`];
      },
    },
    getCouponByCode,
  )
  .define(
    "getModulesAndLessonsByCourseId",
    {
      ttl: ONE_HOUR,
      serialize: (args) => args.courseId,
      references(args) {
        return [`course~modules-lessons~${args.courseId}`];
      },
    },
    getModulesAndLessonsByCourseId,
  );
