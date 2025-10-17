import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteSupportTicketCommentAttachmentsById } from "~/routes/support-tickets/mutations.js";

export async function deleteSupportTicketCommentAttachmentHandler(
  request: FastifyRequest<{
    Params: { ticketId: string; commentId: string; attachmentId: string };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:comments:delete",
  });

  const fastify = request.server;
  const { ticketId, commentId, attachmentId } = request.params;

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

  if (!supportTicket.comments?.find((comment) => comment.id === commentId)) {
    log.debug(
      `Support ticket comment with id ${commentId} not found in ticket ${ticketId}`,
    );
    return reply.notFound("Support ticket comment not found");
  }

  const [deletedErr, deletedSupportTicketAttachment] = await fastify.to(
    deleteSupportTicketCommentAttachmentsById({ commentId, attachmentId }),
  );

  if (deletedErr) {
    log.error(
      deletedErr,
      `Error deleting support ticket attachment with id ${attachmentId}`,
    );
    return reply.internalServerError();
  }

  if (!deletedSupportTicketAttachment) {
    log.debug(
      `Failed to delete support ticket attachment with id ${attachmentId}`,
    );
    return reply.internalServerError();
  }

  await reply.server.cache.invalidateAll([
    deletedSupportTicketAttachment.ticketId,
  ]);

  log.debug(
    `Support ticket attachment with id ${attachmentId} deleted successfully`,
  );

  reply.statusCode = 204;

  return;
}
