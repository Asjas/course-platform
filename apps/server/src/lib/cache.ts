import { createCache } from "async-cache-dedupe";
import { deserialize, serialize } from "superjson";
import {
  getAnnouncementStats,
  getCouponStats,
  getCourseStats,
  getPlatformStats,
  getProgressStats,
  getRevenueStats,
  getSupportStats,
  getTeamLicenseStats,
  getUserStats,
  getWishlistStats,
} from "~/db/queries/stats.js";
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
import {
  getAllAsAdminCourses,
  getAllCourses,
  getCourseById,
  getLessonById,
  getModulesAndLessonsByCourseId,
} from "~/routers/courses/queries.js";
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
  )
  .define(
    "getAllCoursesAsAdmin",
    {
      ttl: ONE_HOUR,
      serialize: () => "course~all~admin",
      references() {
        return ["course~all"];
      },
    },
    getAllAsAdminCourses,
  )
  .define(
    "getAllCourses",
    {
      ttl: ONE_HOUR,
      serialize: () => "all",
      references() {
        return ["course~all"];
      },
    },
    getAllCourses,
  )
  .define(
    "getCourseById",
    {
      ttl: ONE_HOUR,
      serialize: (args) => args.courseId,
      references(args) {
        return [`course~id~${args.courseId}`];
      },
    },
    getCourseById,
  )
  .define(
    "getLessonById",
    {
      ttl: ONE_HOUR,
      serialize: (args) => args.lessonId,
      references(args) {
        return [`lesson~id~${args.lessonId}`];
      },
    },
    getLessonById,
  )
  .define(
    "getCourseStats",
    {
      ttl: ONE_HOUR,
      serialize: () => "stats~courses",
      references() {
        return ["stats~all", "course~all", "enrollment~all"];
      },
    },
    getCourseStats,
  )
  .define(
    "getPlatformStats",
    {
      ttl: ONE_HOUR,
      serialize: () => "stats~platform",
      references() {
        return ["stats~all", "course~all", "enrollment~all"];
      },
    },
    getPlatformStats,
  )
  .define(
    "getRevenueStats",
    {
      ttl: ONE_HOUR,
      serialize: () => "stats~revenue",
      references() {
        return ["stats~all", "payment~all", "enrollment~all", "invoice~all"];
      },
    },
    getRevenueStats,
  )
  .define(
    "getSupportStats",
    {
      ttl: ONE_HOUR,
      serialize: () => "stats~support",
      references() {
        return ["stats~all", "support-ticket~all"];
      },
    },
    getSupportStats,
  )
  .define(
    "getUserStats",
    {
      ttl: ONE_HOUR,
      serialize: () => "stats~users",
      references() {
        return ["stats~all", "user~all"];
      },
    },
    getUserStats,
  )
  .define(
    "getCouponStats",
    {
      ttl: ONE_HOUR,
      serialize: () => "stats~coupons",
      references() {
        return ["stats~all", "coupon~all"];
      },
    },
    getCouponStats,
  )
  .define(
    "getTeamLicenseStats",
    {
      ttl: ONE_HOUR,
      serialize: () => "stats~team-licenses",
      references() {
        return ["stats~all", "team-license~all"];
      },
    },
    getTeamLicenseStats,
  )
  .define(
    "getProgressStats",
    {
      ttl: ONE_HOUR,
      serialize: () => "stats~progress",
      references() {
        return ["stats~all", "progress~all"];
      },
    },
    getProgressStats,
  )
  .define(
    "getWishlistStats",
    {
      ttl: ONE_HOUR,
      serialize: () => "stats~wishlists",
      references() {
        return ["stats~all", "wishlist~all", "course~all"];
      },
    },
    getWishlistStats,
  )
  .define(
    "getAnnouncementStats",
    {
      ttl: ONE_HOUR,
      serialize: () => "stats~announcements",
      references() {
        return ["stats~all", "announcement~all"];
      },
    },
    getAnnouncementStats,
  );
