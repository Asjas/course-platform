import type { FastifyReply, FastifyRequest } from "fastify";
import { getCouponById } from "~/routes/coupons/queries.js";

export async function getCouponByIdHandler(
  request: FastifyRequest<{ Params: { couponId: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:coupons:id",
  });

  const { couponId } = request.params;

  try {
    const coupon = await getCouponById({ couponId });

    if (!coupon) {
      log.debug(`Coupon with id ${couponId} not found`);
      return reply.notFound("Coupon not found");
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Fetched coupon with id ${couponId} successfully`);

    return coupon;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to fetch coupon with id ${couponId}`);
    }

    return reply.internalServerError();
  }
}
