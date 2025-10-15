import type { FastifyReply, FastifyRequest } from "fastify";
import { type Coupon, updateCouponById } from "~/routes/coupons/mutations.js";
import { getCouponById } from "~/routes/coupons/queries.js";

export async function updateCouponByIdHandler(
  request: FastifyRequest<{
    Params: { couponId: string };
    Body: { updates: Coupon };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:coupons:update:id",
  });

  const { couponId } = request.params;
  const { updates } = request.body;

  if (Object.keys(updates).length === 0) {
    log.debug("No coupon data provided in request body");
    return reply.badRequest("No coupon data provided in request body");
  }

  try {
    const existingCoupon = await getCouponById({ couponId });

    if (!existingCoupon) {
      log.debug(`Coupon with id ${couponId} not found for update`);
      return reply.notFound("Coupon not found");
    }

    const updatedCoupon = await updateCouponById({ couponId, updates });

    if (!updatedCoupon) {
      log.debug(`Failed to update coupon with id ${couponId}`);
      return reply.internalServerError();
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Coupon with id ${couponId} updated successfully`);

    return updatedCoupon;
  } catch (error) {
    if (error instanceof Error) {
      log.error(error, `Error updating coupon with id ${couponId}`);
    }

    return reply.internalServerError();
  }
}
