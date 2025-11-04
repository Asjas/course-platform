import { TRPCError } from "@trpc/server";
import * as z from "zod";
import type { NewCoupon } from "~/db/schema/coupon.js";
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

export const couponsRouter = router({
  getAllCoupons: publicProcedure
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
    .mutation(async ({ ctx, input }): Promise<NewCoupon> => {
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

      return redemption;
    }),
});
