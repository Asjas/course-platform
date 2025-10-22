import * as z from "zod";
import { publicProcedure, router } from "~/router.js";
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
  getAllCoupons: publicProcedure.query(
    async ({ ctx }): Promise<CouponsReturnType> => {
      if (!ctx.user || !ctx.hasRole("admin")) {
        throw ctx.reply.unauthorized();
      }

      const fastify = ctx.reply.server;

      const [err, coupons] = await fastify.to(fastify.cache.getAllCoupons());

      if (err) {
        ctx.request.log.error(err, "Failed to fetch all coupons");
        return ctx.reply.internalServerError();
      }

      return coupons;
    },
  ),
  getCouponById: publicProcedure
    .input(z.object({ couponId: z.string() }))
    .query(
      async ({ ctx, input: { couponId } }): Promise<CouponByIdReturnType> => {
        if (!ctx.user || !ctx.hasRole("admin")) {
          throw ctx.reply.unauthorized();
        }

        const fastify = ctx.reply.server;

        const [err, coupon] = await fastify.to(
          fastify.cache.getCouponById({ couponId }),
        );

        if (err) {
          ctx.request.log.error(
            err,
            `Failed to fetch coupon with id ${couponId}`,
          );
          return ctx.reply.internalServerError();
        }

        if (!coupon) {
          ctx.request.log.debug(`Coupon with id ${couponId} not found`);
          return ctx.reply.notFound("Coupon not found");
        }

        ctx.request.log.debug(
          `Fetched coupon with id ${coupon.id} successfully`,
        );

        return coupon;
      },
    ),
  getCouponByCode: publicProcedure
    .input(z.object({ couponCode: z.string() }))
    .query(
      async ({
        ctx,
        input: { couponCode },
      }): Promise<CouponByCodeReturnType> => {
        if (!ctx.user || !ctx.hasRole("admin")) {
          throw ctx.reply.unauthorized();
        }

        const fastify = ctx.reply.server;

        const [err, coupon] = await fastify.to(
          fastify.cache.getCouponByCode({ couponCode }),
        );

        if (err) {
          ctx.request.log.error(
            err,
            `Failed to fetch coupon with code ${couponCode}`,
          );
          return ctx.reply.internalServerError();
        }

        if (!coupon) {
          ctx.request.log.debug(`Coupon with code ${couponCode} not found`);
          return ctx.reply.notFound("Coupon not found");
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
        validTo: z.date().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.hasRole("admin")) {
        throw ctx.reply.unauthorized();
      }

      const fastify = ctx.reply.server;

      const [err, coupon] = await fastify.to(
        insertCoupon({ newCoupon: input }),
      );

      if (err) {
        ctx.request.log.error(err, "Failed to insert coupon");
        return ctx.reply.internalServerError();
      }

      ctx.request.log.debug(
        `Inserted coupon with id ${coupon.id} successfully`,
      );

      return coupon;
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
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.hasRole("admin")) {
        throw ctx.reply.unauthorized();
      }

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
        return ctx.reply.internalServerError();
      }

      ctx.request.log.debug(`Updated coupon with id ${coupon.id} successfully`);

      return coupon;
    }),
  deleteCouponById: publicProcedure
    .input(z.object({ couponId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.hasRole("admin")) {
        throw ctx.reply.unauthorized();
      }

      const fastify = ctx.reply.server;

      const [err, coupon] = await fastify.to(
        deleteCouponById({ couponId: input.couponId }),
      );

      if (err) {
        ctx.request.log.error(
          err,
          `Failed to delete coupon with id ${input.couponId}`,
        );
        return ctx.reply.internalServerError();
      }

      ctx.request.log.debug(`Deleted coupon with id ${coupon.id} successfully`);

      return coupon;
    }),
  redeemCouponByCode: publicProcedure
    .input(z.object({ couponCode: z.string(), courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw ctx.reply.unauthorized();
      }

      const fastify = ctx.reply.server;

      const [err, redemption] = await fastify.to(
        redeemCouponByCode({
          couponCode: input.couponCode,
          userId: ctx.user.id,
          courseId: input.courseId,
        }),
      );

      if (err) {
        ctx.request.log.error(
          err,
          `Failed to redeem coupon with code ${input.couponCode}`,
        );
        return ctx.reply.internalServerError();
      }

      ctx.request.log.debug(
        `Redeemed coupon with redemption ${redemption.id} successfully`,
      );

      return redemption;
    }),
});
