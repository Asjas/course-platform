import type { FastifyReply, FastifyRequest } from "fastify";

export async function getSupportTicketHandler(
  request: FastifyRequest<{ Params: { ticketId: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:get",
  });

  const fastify = reply.server;
  const { ticketId } = request.params;

  const [err, supportTicket] = await fastify.to(
    fastify.cache.getSupportTicketById({
      ticketId,
    }),
  );

  if (err) {
    log.error(err, `Failed to fetch support ticket with id ${ticketId}`);
    return reply.internalServerError();
  }

  if (!supportTicket) {
    log.debug(`Support ticket with id ${ticketId} not found`);
    return reply.notFound("Support ticket not found");
  }

  reply.cacheControl("private");
  reply.cacheControl("max-age", "5m");
  reply.stale("if-error", "1h");
  reply.vary("Cookie");

  log.debug(`Fetched support ticket with id ${supportTicket.id} successfully`);

  return supportTicket;
}
