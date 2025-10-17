import type { FastifyReply, FastifyRequest } from "fastify";
import {
  type NewSupportTicketAttachment,
  insertSupportTicketAttachment,
} from "~/routes/support-tickets/mutations.js";

export async function createSupportTicketCommentAttachmentsHandler(
  request: FastifyRequest<{
    Params: { ticketId: string; commentId: string };
    Body: {
      attachmentData: Omit<NewSupportTicketAttachment, "ticketId">;
    };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:comment:attachments:create",
  });

  const fastify = request.server;
  const { ticketId, commentId } = request.params;
  const { attachmentData } = request.body;

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

  const commentExists = supportTicket.comments?.some(
    (comment) => comment.id === commentId,
  );

  if (!commentExists) {
    log.debug(
      `Support ticket comment with id ${commentId} not found in ticket ${ticketId}`,
    );
    return reply.notFound("Support ticket comment not found");
  }

  const newSupportTicketAttachment: NewSupportTicketAttachment = {
    ...attachmentData,
    ticketId,
    commentId,
  };

  const [attachmentErr, newAttachment] = await fastify.to(
    insertSupportTicketAttachment({ newSupportTicketAttachment }),
  );

  if (attachmentErr) {
    log.error(
      attachmentErr,
      `Error creating attachment for support ticket comment with id ${commentId}`,
    );
    return reply.internalServerError();
  }

  if (!newAttachment) {
    log.debug(
      `Failed to create attachment for support ticket comment with id ${commentId}`,
    );
    return reply.internalServerError();
  }

  log.debug(
    `Attachment for support ticket comment with id ${commentId} created successfully`,
  );

  await reply.server.cache.invalidateAll([newAttachment.ticketId]);

  reply.statusCode = 201;

  return newAttachment;
}
