import type { FastifyReply, FastifyRequest } from "fastify";
import { type NewCoupon, insertCoupon } from "~/routes/coupons/mutations.js";

export async function createCouponHandler(
  request: FastifyRequest<{ Body: { newCoupon: NewCoupon } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:coupons:create",
  });

  const { newCoupon } = request.body;

  if (!newCoupon) {
    log.debug("No coupon data provided in request body");
    return reply.badRequest("No coupon data provided in request body");
  }

  try {
    const result = await insertCoupon({ newCoupon });

    if (!result) {
      log.debug(`Failed to create coupon: ${JSON.stringify(newCoupon)}`);
      return reply.badRequest("Failed to create coupon");
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Coupon created successfully with id ${result.id}`);

    reply.statusCode = 201;

    return result;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Error creating coupon: ${JSON.stringify(newCoupon)}`);
    }

    return reply.internalServerError();
  }
}
