import type { FastifyReply, FastifyRequest } from "fastify";
import {
  type NewSupportTicketAttachment,
  insertSupportTicketAttachment,
} from "~/routes/support-tickets/mutations.js";

export async function createSupportTicketAttachmentsHandler(
  request: FastifyRequest<{
    Params: { ticketId: string };
    Body: {
      attachmentData: Omit<NewSupportTicketAttachment, "ticketId">;
    };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:attachments:create",
  });

  const fastify = request.server;
  const { ticketId } = request.params;
  const { attachmentData } = request.body;

  const newSupportTicketAttachment: NewSupportTicketAttachment = {
    ...attachmentData,
    ticketId,
  };

  const [err, newAttachment] = await fastify.to(
    insertSupportTicketAttachment({ newSupportTicketAttachment }),
  );

  if (err) {
    log.error(
      err,
      `Error creating attachment for support ticket with id ${ticketId}`,
    );
    return reply.internalServerError();
  }

  if (!newAttachment) {
    log.debug(
      `Failed to create attachment for support ticket with id ${ticketId}`,
    );
    return reply.internalServerError();
  }

  log.debug(
    `Attachment for support ticket with id ${ticketId} created successfully`,
  );

  await reply.server.cache.invalidateAll([ticketId]);

  reply.statusCode = 201;

  return newAttachment;
}
