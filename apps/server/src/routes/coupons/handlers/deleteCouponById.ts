import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteCouponById } from "~/routes/coupons/mutations.js";
import { getCouponById } from "~/routes/coupons/queries.js";

export async function deleteCouponByIdHandler(
  request: FastifyRequest<{ Params: { couponId: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:coupons:delete:id",
  });

  // TODO: Check if the user has permission

  const { couponId } = request.params;

  try {
    const coupon = await getCouponById({ couponId });

    if (!coupon) {
      log.debug(`Coupon with id ${couponId} not found`);
      return reply.notFound("Coupon not found");
    }

    const deletedCoupon = await deleteCouponById({ couponId });

    if (!deletedCoupon) {
      log.debug(`Failed to delete coupon with id ${couponId}`);
      return reply.internalServerError();
    }

    log.debug(`Coupon with id ${couponId} deleted successfully`);

    reply.statusCode = 204;

    return;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Error deleting coupon with id ${couponId}`);
    }

    return reply.internalServerError();
  }
}
