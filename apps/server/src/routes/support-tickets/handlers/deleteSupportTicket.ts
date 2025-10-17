import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteSupportTicketById } from "~/routes/support-tickets/mutations.js";

export async function deleteSupportTicketHandler(
  request: FastifyRequest<{ Params: { ticketId: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:delete",
  });

  const fastify = request.server;
  const { ticketId } = request.params;

  const [err, deletedSupportTicket] = await fastify.to(
    deleteSupportTicketById({ ticketId }),
  );

  if (err) {
    log.error(err, `Error deleting support ticket with id ${ticketId}`);
    return reply.internalServerError();
  }

  if (!deletedSupportTicket) {
    log.debug(`Failed to delete support ticket with id ${ticketId}`);
    return reply.internalServerError();
  }

  await reply.server.cache.invalidateAll([ticketId, "support-tickets~all"]);

  log.debug(`Support ticket with id ${ticketId} deleted successfully`);

  reply.statusCode = 204;

  return;
}
