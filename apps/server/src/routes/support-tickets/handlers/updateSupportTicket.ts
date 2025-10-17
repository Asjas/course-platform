import type { FastifyReply, FastifyRequest } from "fastify";
import {
  type SupportTicket,
  updateSupportTicketById,
} from "~/routes/support-tickets/mutations.js";
import { getSupportTicketById } from "~/routes/support-tickets/queries.js";

export async function updateSupportTicketHandler(
  request: FastifyRequest<{
    Params: { ticketId: string };
    Body: { updates: SupportTicket };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:update",
  });

  const fastify = request.server;
  const { ticketId } = request.params;
  const { updates } = request.body;

  if (Object.keys(updates).length === 0) {
    log.debug("No support ticket data provided in request body");
    return reply.badRequest("No support ticket data provided in request body");
  }

  const [err, existingSupportTicket] = await fastify.to(
    getSupportTicketById({ ticketId }),
  );

  if (err) {
    log.error(err, `Error fetching support ticket with id ${ticketId}`);
    return reply.internalServerError();
  }

  if (!existingSupportTicket) {
    log.debug(`Support ticket with id ${ticketId} not found for update`);
    return reply.notFound("Support ticket not found");
  }

  // TODO: Check if the user has permission to update this support ticket

  const [updateErr, updatedSupportTicket] = await fastify.to(
    updateSupportTicketById({
      ticketId,
      updates,
    }),
  );

  if (updateErr) {
    log.error(updateErr, `Error updating support ticket with id ${ticketId}`);
    return reply.internalServerError();
  }

  if (!updatedSupportTicket) {
    log.debug(`Failed to update support ticket with id ${ticketId}`);
    return reply.internalServerError();
  }

  await fastify.cache.invalidateAll([ticketId, "support-tickets~all"]);

  reply.cacheControl("private");
  reply.cacheControl("max-age", "5m");
  reply.stale("if-error", "1h");
  reply.vary("Cookie");

  log.debug(
    `Support ticket with id ${updatedSupportTicket.id} updated successfully`,
  );

  return updatedSupportTicket;
}
