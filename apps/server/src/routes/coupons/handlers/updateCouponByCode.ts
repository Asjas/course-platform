import type { FastifyReply, FastifyRequest } from "fastify";
import { type Coupon, updateCouponByCode } from "~/routes/coupons/mutations.js";
import { getCouponByCode } from "~/routes/coupons/queries.js";

export async function updateCouponByCodeHandler(
  request: FastifyRequest<{
    Params: { couponCode: string };
    Body: { updates: Coupon };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:coupons:update:code",
  });

  const { couponCode } = request.params;
  const { updates } = request.body;

  if (Object.keys(updates).length === 0) {
    log.debug("No coupon data provided in request body");
    return reply.badRequest("No coupon data provided in request body");
  }

  try {
    const existingCoupon = await getCouponByCode({ couponCode });

    if (!existingCoupon) {
      log.debug(`Coupon with id ${couponCode} not found for update`);
      return reply.notFound("Coupon not found");
    }

    const updatedCoupon = await updateCouponByCode({ couponCode, updates });

    if (!updatedCoupon) {
      log.debug(`Failed to update coupon with id ${couponCode}`);
      return reply.internalServerError();
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Coupon with id ${couponCode} updated successfully`);

    return updatedCoupon;
  } catch (error) {
    if (error instanceof Error) {
      log.error(error, `Error updating coupon with id ${couponCode}`);
    }

    return reply.internalServerError();
  }
}
