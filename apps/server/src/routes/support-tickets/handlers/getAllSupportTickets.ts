import type { FastifyReply, FastifyRequest } from "fastify";

export async function getAllSupportTicketsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:get:all",
  });

  const fastify = reply.server;

  const [err, supportTickets] = await fastify.to(
    fastify.cache.getAllSupportTickets(),
  );
  const count = supportTickets.length ?? 0;

  if (err) {
    log.error(err, "Failed to fetch support tickets");
    return reply.internalServerError();
  }

  reply.cacheControl("private");
  reply.cacheControl("max-age", "5m");
  reply.stale("if-error", "1h");
  reply.vary("Cookie");

  log.debug(`Fetched all ${count} support tickets`);

  return { supportTickets, count };
}
