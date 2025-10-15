import type { FastifyReply, FastifyRequest } from "fastify";
import { getAllCoupons } from "~/routes/coupons/queries.js";

export async function getCouponsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:coupons:all",
  });

  try {
    const coupons = await getAllCoupons();

    if (!coupons) {
      log.debug("No coupons found");
      return reply.notFound("No coupons found");
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Fetched all ${coupons.count} coupons`);

    return coupons;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Error fetching all coupons");
    }

    return reply.internalServerError();
  }
}
