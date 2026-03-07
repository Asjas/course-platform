import { TRPCError } from "@trpc/server";
import * as z from "zod";
import type { Coupon } from "~/db/schema/coupon.js";
import { notifyAdminCouponUsageThreshold } from "~/lib/notifications.js";
import {
  type EntitySyncUpdate,
  couponsSyncConfig,
  createSyncUpdate,
  getEntityUpdatesSince,
  publishEntityChange,
  streamEntityUpdates,
} from "~/lib/sse-sync.js";
import { isAdmin, publicProcedure, router } from "~/router.js";
import {
  deleteCouponById,
  insertCoupon,
  redeemCouponByCode,
  updateCouponById,
} from "~/routers/coupons/mutations.js";
import {
  type CouponByCodeReturnType,
  type CouponByIdReturnType,
  type CouponsReturnType,
} from "~/routers/coupons/queries.js";

export type CouponSyncUpdate = EntitySyncUpdate<Coupon>;

export const couponsRouter = router({
  getAll: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<CouponsReturnType> => {
      const fastify = ctx.reply.server;

      const [err, coupons] = await fastify.to(fastify.cache.getAllCoupons());

      if (err) {
        ctx.request.log.error(err, "Failed to fetch all coupons");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      ctx.request.log.debug(
        `Retrieved ${coupons.length} coupons from cache/db`,
      );

      return coupons;
    }),
  getCouponById: publicProcedure
    .input(z.object({ couponId: z.string() }))
    .use(isAdmin)
    .query(
      async ({ ctx, input: { couponId } }): Promise<CouponByIdReturnType> => {
        const fastify = ctx.reply.server;

        const [err, coupon] = await fastify.to(
          fastify.cache.getCouponById({ couponId }),
        );

        if (err) {
          ctx.request.log.error(
            err,
            `Failed to fetch coupon with id ${couponId}`,
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          });
        }

        if (!coupon) {
          ctx.request.log.debug(`Coupon with id ${couponId} not found`);

          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Coupon not found",
          });
        }

        ctx.request.log.debug(
          `Fetched coupon with id ${coupon.id} successfully`,
        );

        return coupon;
      },
    ),
  getCouponByCode: publicProcedure
    .input(z.object({ couponCode: z.string() }))
    .use(isAdmin)
    .query(
      async ({
        ctx,
        input: { couponCode },
      }): Promise<CouponByCodeReturnType> => {
        const fastify = ctx.reply.server;

        const [err, coupon] = await fastify.to(
          fastify.cache.getCouponByCode({ couponCode }),
        );

        if (err) {
          ctx.request.log.error(
            err,
            `Failed to fetch coupon with code ${couponCode}`,
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          });
        }

        if (!coupon) {
          ctx.request.log.debug(`Coupon with code ${couponCode} not found`);
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Coupon not found",
          });
        }

        ctx.request.log.debug(
          `Fetched coupon with code ${coupon.code} successfully`,
        );

        return coupon;
      },
    ),
  insertCoupon: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        active: z.boolean(),
        code: z.string(),
        courseId: z.string().nullable(),
        currentRedemptions: z.number().optional(),
        description: z.string().nullable(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number(),
        redemptionLimit: z.number(),
        validFrom: z.date(),
        validUntil: z.date().nullable(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }): Promise<Coupon> => {
      const fastify = ctx.reply.server;

      const [err, newCoupon] = await fastify.to(
        insertCoupon({ newCoupon: input }),
      );

      if (err) {
        ctx.request.log.error(err, "Failed to insert coupon");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll(["coupon~all"]);

      ctx.request.log.debug(
        `Inserted coupon with id ${newCoupon.id} successfully`,
      );

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          couponsSyncConfig,
          createSyncUpdate(
            "created",
            newCoupon.id,
            newCoupon as Coupon,
            ctx.user.id,
          ),
        );
      } catch (sseErr) {
        ctx.request.log.error(sseErr, "Failed to publish coupon to SSE");
      }

      return newCoupon;
    }),
  updateCouponById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        active: z.boolean().optional(),
        code: z.string(),
        courseId: z.string().nullable(),
        currentRedemptions: z.number().optional(),
        description: z.string().nullable(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number(),
        maxRedemptions: z.number().nullable(),
        validFrom: z.date(),
        validTo: z.date().nullable(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, coupon] = await fastify.to(
        updateCouponById({
          couponId: input.id,
          updates: input,
        }),
      );

      if (err) {
        ctx.request.log.error(
          err,
          `Failed to update coupon with id ${input.id}`,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "coupon~all",
        `coupon~code~${coupon.code}`,
        `coupon~id~${coupon.id}`,
      ]);

      ctx.request.log.debug(`Updated coupon with id ${coupon.id} successfully`);

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          couponsSyncConfig,
          createSyncUpdate("updated", coupon.id, coupon, ctx.user.id),
        );
      } catch (sseErr) {
        ctx.request.log.error(sseErr, "Failed to publish coupon update to SSE");
      }

      return coupon;
    }),
  deleteCouponById: publicProcedure
    .input(z.object({ couponId: z.string() }))
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, coupon] = await fastify.to(
        deleteCouponById({ couponId: input.couponId }),
      );

      if (err) {
        ctx.request.log.error(
          err,
          `Failed to delete coupon with id ${input.couponId}`,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "coupon~all",
        `coupon~code~${coupon.code}`,
        `coupon~id~${coupon.id}`,
      ]);

      ctx.request.log.debug(`Deleted coupon with id ${coupon.id} successfully`);

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          couponsSyncConfig,
          createSyncUpdate("deleted", coupon.id, null, ctx.user.id),
        );
      } catch (sseErr) {
        ctx.request.log.error(
          sseErr,
          "Failed to publish coupon deletion to SSE",
        );
      }

      return coupon;
    }),
  redeemCouponByCode: publicProcedure
    .input(
      z.object({
        couponCode: z.string(),
        paymentId: z.string(),
        courseId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, redemption] = await fastify.to(
        redeemCouponByCode({
          couponCode: input.couponCode,
          paymentId: input.paymentId,
          courseId: input.courseId,
        }),
      );

      if (err) {
        ctx.request.log.error(
          err,
          `Failed to redeem coupon with code ${input.couponCode}`,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      const [couponErr, coupon] = await fastify.to(
        fastify.cache.getCouponByCode({ couponCode: input.couponCode }),
      );

      if (couponErr || !coupon) {
        ctx.request.log.error(
          couponErr,
          `Failed to fetch coupon with code ${input.couponCode} after redemption`,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "coupon~all",
        `coupon~code~${coupon.code}`,
        `coupon~id~${coupon.id}`,
      ]);

      ctx.request.log.debug(
        `Redeemed coupon with redemption ${redemption.id} successfully`,
      );

      // Check if coupon is approaching redemption limit and notify admins
      try {
        const currentRedemptions = coupon.redemptions?.length || 0;
        const limit = coupon.redemptionLimit;

        // Notify when reaching 80%, 90%, or 100% of limit
        if (
          (limit > 0 && currentRedemptions === limit) ||
          (limit >= 10 && currentRedemptions === Math.floor(limit * 0.9)) ||
          (limit >= 5 && currentRedemptions === Math.floor(limit * 0.8))
        ) {
          await notifyAdminCouponUsageThreshold({
            couponCode: coupon.code,
            redemptionCount: currentRedemptions,
            redemptionLimit: limit,
          });
        }
      } catch (notificationErr) {
        // Log but don't fail the request
        ctx.request.log.error(
          notificationErr,
          "Failed to send admin notification for coupon usage threshold",
        );
      }

      return redemption;
    }),

  /**
   * Subscribe to real-time coupon updates via SSE.
   * Admin-only: Clients receive updates when coupons are created, updated, or deleted.
   */
  subscribeToUpdates: publicProcedure
    .input(
      z.object({
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAdmin)
    .subscription(async function* ({ input }) {
      yield* streamEntityUpdates<Coupon>(couponsSyncConfig, input.lastEventId);
    }),

  /**
   * Get coupon updates since a specific timestamp.
   * Admin-only: Useful for syncing offline clients that have been disconnected.
   */
  getUpdatesSince: publicProcedure
    .input(
      z.object({
        since: z.number(), // Timestamp in ms
      }),
    )
    .use(isAdmin)
    .query(async ({ input }) => {
      try {
        const updates = await getEntityUpdatesSince<Coupon>(
          couponsSyncConfig,
          input.since,
        );
        return updates;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch coupon updates",
        });
      }
    }),
});
