import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteSupportTicketAttachmentById } from "~/routes/support-tickets/mutations.js";

export async function deleteSupportTicketAttachmentHandler(
  request: FastifyRequest<{
    Params: { ticketId: string; attachmentId: string };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:attachments:delete",
  });

  const fastify = request.server;
  const { ticketId, attachmentId } = request.params;

  const [err, supportTicket] = await fastify.to(
    fastify.cache.getSupportTicketById({ ticketId }),
  );

  if (err) {
    log.error(err, `Error fetching support ticket with id ${ticketId}`);
    return reply.internalServerError();
  }

  if (!supportTicket) {
    log.debug(`Support ticket with id ${ticketId} not found for deletion`);
    return reply.notFound("Support ticket not found");
  }

  const [deletedErr, deletedSupportTicketAttachment] = await fastify.to(
    deleteSupportTicketAttachmentById({ attachmentId }),
  );

  if (deletedErr) {
    log.error(
      deletedErr,
      `Error deleting support ticket attachment with id ${attachmentId}`,
    );
    return reply.internalServerError();
  }

  if (!deletedSupportTicketAttachment) {
    log.debug(`Failed to delete support ticket attachment with id ${ticketId}`);
    return reply.internalServerError();
  }

  await reply.server.cache.invalidateAll([
    deletedSupportTicketAttachment.ticketId,
  ]);

  log.debug(
    `Support ticket attachment with id ${ticketId} deleted successfully`,
  );

  reply.statusCode = 204;

  return;
}
