import type { FastifyReply, FastifyRequest } from "fastify";
import { getCouponByCode } from "~/routes/coupons/queries.js";

export async function getCouponByCodeHandler(
  request: FastifyRequest<{ Params: { couponCode: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:coupons:code",
  });

  const { couponCode } = request.params;

  try {
    const coupon = await getCouponByCode({ couponCode });

    if (!coupon) {
      log.debug(`Coupon with code ${couponCode} not found`);
      return reply.notFound("Coupon not found");
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Fetched coupon with code ${couponCode} successfully`);

    return coupon;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to fetch coupon with code ${couponCode}`);
    }

    return reply.internalServerError();
  }
}
