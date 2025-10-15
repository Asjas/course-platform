import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteCouponByCode } from "~/routes/coupons/mutations.js";
import { getCouponByCode } from "~/routes/coupons/queries.js";

export async function deleteCouponByCodeHandler(
  request: FastifyRequest<{ Params: { couponCode: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:coupons:delete:code",
  });

  // TODO: Check if the user has permission

  const { couponCode } = request.params;

  try {
    const coupon = await getCouponByCode({ couponCode });

    if (!coupon) {
      log.debug(`Coupon with code ${couponCode} not found`);
      return reply.notFound("Coupon not found");
    }

    const deletedCoupon = await deleteCouponByCode({ couponCode });

    if (!deletedCoupon) {
      log.debug(`Failed to delete coupon with code ${couponCode}`);
      return reply.internalServerError();
    }

    log.debug(`Coupon with code ${couponCode} deleted successfully`);

    reply.statusCode = 204;

    return;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Error deleting coupon with id ${couponCode}`);
    }

    return reply.internalServerError();
  }
}
