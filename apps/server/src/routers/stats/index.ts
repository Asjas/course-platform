import { TRPCError } from "@trpc/server";
import type {
  AnnouncementStats,
  CouponStats,
  CourseStats,
  PlatformStats,
  ProgressStats,
  RevenueStats,
  SupportStats,
  TeamLicenseStats,
  UserStats,
  WishlistStats,
} from "~/db/queries/stats.js";
import { isAdmin, publicProcedure, router } from "~/router.js";

export const statsRouter = router({
  // Get course statistics
  getCourseStats: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<CourseStats> => {
      const fastify = ctx.reply.server;

      const [err, stats] = await fastify.to(fastify.cache.getCourseStats());

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch course statistics",
        });
      }

      return stats;
    }),

  // Get platform statistics
  getPlatformStats: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<PlatformStats> => {
      const fastify = ctx.reply.server;

      const [err, stats] = await fastify.to(fastify.cache.getPlatformStats());

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch platform statistics",
        });
      }

      return stats;
    }),

  // Get revenue statistics
  getRevenueStats: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<RevenueStats> => {
      const fastify = ctx.reply.server;

      const [err, stats] = await fastify.to(fastify.cache.getRevenueStats());

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch revenue statistics",
        });
      }

      return stats;
    }),

  // Get support ticket statistics
  getSupportStats: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<SupportStats> => {
      const fastify = ctx.reply.server;

      const [err, stats] = await fastify.to(fastify.cache.getSupportStats());

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch support statistics",
        });
      }

      return stats;
    }),

  // Get user statistics
  getUserStats: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<UserStats> => {
      const fastify = ctx.reply.server;

      const [err, stats] = await fastify.to(fastify.cache.getUserStats());

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user statistics",
        });
      }

      return stats;
    }),

  // Get coupon statistics
  getCouponStats: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<CouponStats> => {
      const fastify = ctx.reply.server;

      const [err, stats] = await fastify.to(fastify.cache.getCouponStats());

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch coupon statistics",
        });
      }

      return stats;
    }),

  // Get team license statistics
  getTeamLicenseStats: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<TeamLicenseStats> => {
      const fastify = ctx.reply.server;

      const [err, stats] = await fastify.to(
        fastify.cache.getTeamLicenseStats(),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch team license statistics",
        });
      }

      return stats;
    }),

  // Get progress statistics
  getProgressStats: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<ProgressStats> => {
      const fastify = ctx.reply.server;

      const [err, stats] = await fastify.to(fastify.cache.getProgressStats());

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch progress statistics",
        });
      }

      return stats;
    }),

  // Get wishlist statistics
  getWishlistStats: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<WishlistStats> => {
      const fastify = ctx.reply.server;

      const [err, stats] = await fastify.to(fastify.cache.getWishlistStats());

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch wishlist statistics",
        });
      }

      return stats;
    }),

  // Get announcement statistics
  getAnnouncementStats: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<AnnouncementStats> => {
      const fastify = ctx.reply.server;

      const [err, stats] = await fastify.to(
        fastify.cache.getAnnouncementStats(),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch announcement statistics",
        });
      }

      return stats;
    }),
});
