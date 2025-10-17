import type { FastifyReply, FastifyRequest } from "fastify";
import {
  type SupportTicketComment,
  updateSupportTicketCommentById,
} from "~/routes/support-tickets/mutations.js";
import {
  getSupportTicketById,
  getSupportTicketCommentById,
} from "~/routes/support-tickets/queries.js";

export async function updateSupportTicketCommentHandler(
  request: FastifyRequest<{
    Params: { ticketId: string; commentId: string };
    Body: { updates: SupportTicketComment };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:comment:update",
  });

  const fastify = request.server;
  const { ticketId, commentId } = request.params;
  const { updates } = request.body;

  if (Object.keys(updates).length === 0) {
    log.debug("No support ticket comment data provided in request body");
    return reply.badRequest(
      "No support ticket comment data provided in request body",
    );
  }

  const [err, supportTicket] = await fastify.to(
    getSupportTicketById({ ticketId }),
  );

  if (err) {
    log.error(err, `Error fetching support ticket with id ${ticketId}`);
    return reply.internalServerError();
  }

  if (!supportTicket) {
    log.debug(`Support ticket with id ${ticketId} not found for update`);
    return reply.notFound("Support ticket not found");
  }

  const [existingErr, existingSupportTicketComment] = await fastify.to(
    getSupportTicketCommentById({ commentId }),
  );

  if (existingErr) {
    log.error(
      existingErr,
      `Error fetching support ticket comment with id ${commentId}`,
    );
    return reply.internalServerError();
  }

  if (!existingSupportTicketComment) {
    log.debug(
      `Support ticket comment with id ${commentId} not found for update`,
    );
    return reply.notFound("Support ticket comment not found");
  }

  // TODO: Check if the user has permission to update this support ticket

  const [updateErr, updatedSupportTicketComment] = await fastify.to(
    updateSupportTicketCommentById({
      commentId,
      updates,
    }),
  );

  if (updateErr) {
    log.error(
      updateErr,
      `Error updating support ticket comment with id ${commentId}`,
    );
    return reply.internalServerError();
  }

  if (!updatedSupportTicketComment) {
    log.debug(`Failed to update support ticket comment with id ${commentId}`);
    return reply.internalServerError();
  }

  await fastify.cache.invalidateAll([updatedSupportTicketComment.ticketId]);

  reply.cacheControl("private");
  reply.cacheControl("max-age", "5m");
  reply.stale("if-error", "1h");
  reply.vary("Cookie");

  log.debug(
    `Support ticket comment with id ${updatedSupportTicketComment.id} updated successfully`,
  );

  return updatedSupportTicketComment;
}
