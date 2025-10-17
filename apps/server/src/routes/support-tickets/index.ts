import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import { createSupportTicketHandler } from "~/routes/support-tickets/handlers/createSupportTicket.js";
import { createSupportTicketAttachmentsHandler } from "~/routes/support-tickets/handlers/createSupportTicketAttachments.js";
import { createSupportTicketCommentHandler } from "~/routes/support-tickets/handlers/createSupportTicketComment.js";
import { createSupportTicketCommentAttachmentsHandler } from "~/routes/support-tickets/handlers/createSupportTicketCommentAttachments.js";
import { deleteSupportTicketHandler } from "~/routes/support-tickets/handlers/deleteSupportTicket.js";
import { deleteSupportTicketAttachmentHandler } from "~/routes/support-tickets/handlers/deleteSupportTicketAttachment.js";
import { deleteSupportTicketCommentHandler } from "~/routes/support-tickets/handlers/deleteSupportTicketComment.js";
import { deleteSupportTicketCommentAttachmentHandler } from "~/routes/support-tickets/handlers/deleteSupportTicketCommentAttachment.js";
import { getAllSupportTicketsHandler } from "~/routes/support-tickets/handlers/getAllSupportTickets.js";
import { getSupportTicketHandler } from "~/routes/support-tickets/handlers/getSupportTicket.js";
import { updateSupportTicketHandler } from "~/routes/support-tickets/handlers/updateSupportTicket.js";
import { updateSupportTicketCommentHandler } from "~/routes/support-tickets/handlers/updateSupportTicketComment.js";

export default function supportRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.get("/support-tickets", getAllSupportTicketsHandler);
  fastify.get("/support-tickets/:ticketId", getSupportTicketHandler);
  fastify.post("/support-tickets", createSupportTicketHandler);
  fastify.post(
    "/support-tickets/:ticketId/comments",
    createSupportTicketCommentHandler,
  );
  fastify.post(
    "/support-tickets/:ticketId/attachments",
    createSupportTicketAttachmentsHandler,
  );
  fastify.post(
    "/support-tickets/:ticketId/comments/:commentId/attachments",
    createSupportTicketCommentAttachmentsHandler,
  );
  fastify.put("/support-tickets/:ticketId", updateSupportTicketHandler);
  fastify.put(
    "/support-tickets/:ticketId/comments/:commentId",
    updateSupportTicketCommentHandler,
  );
  fastify.delete("/support-tickets/:ticketId", deleteSupportTicketHandler);
  fastify.delete(
    "/support-tickets/:ticketId/attachments/:attachmentId",
    deleteSupportTicketAttachmentHandler,
  );
  fastify.delete(
    "/support-tickets/:ticketId/comments/:commentId",
    deleteSupportTicketCommentHandler,
  );
  fastify.delete(
    "/support-tickets/:ticketId/comments/:commentId/attachments/:attachmentId",
    deleteSupportTicketCommentAttachmentHandler,
  );

  done();
}
