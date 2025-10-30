import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import { createSupportTicketHandler } from "~/routes/support-tickets/handlers/createSupportTicket.js";
import { createSupportTicketCommentHandler } from "~/routes/support-tickets/handlers/createSupportTicketComment.js";
import { deleteSupportTicketHandler } from "~/routes/support-tickets/handlers/deleteSupportTicket.js";
import { deleteSupportTicketCommentHandler } from "~/routes/support-tickets/handlers/deleteSupportTicketComment.js";
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
  fastify.put("/support-tickets/:ticketId", updateSupportTicketHandler);
  fastify.put(
    "/support-tickets/:ticketId/comments/:commentId",
    updateSupportTicketCommentHandler,
  );
  fastify.delete("/support-tickets/:ticketId", deleteSupportTicketHandler);
  fastify.delete(
    "/support-tickets/:ticketId/comments/:commentId",
    deleteSupportTicketCommentHandler,
  );

  done();
}
