import type { FastifyReply, FastifyRequest } from "fastify";
import {
  type NewSupportTicketComment,
  insertSupportTicketComment,
} from "~/routes/support-tickets/mutations.js";

export async function createSupportTicketCommentHandler(
  request: FastifyRequest<{
    Body: {
      Params: { ticketId: string };
      newSupportTicketComment: NewSupportTicketComment;
    };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:comment:create",
  });

  const fastify = request.server;
  const { ticketId } = request.body.Params;
  const { newSupportTicketComment } = request.body;

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

  if (!newSupportTicketComment) {
    log.debug("No support ticket comment data provided in request body");
    return reply.badRequest(
      "No support ticket comment data provided in request body",
    );
  }

  const [commentErr, supportTicketComment] = await fastify.to(
    insertSupportTicketComment({ newSupportTicketComment }),
  );

  if (commentErr) {
    log.error(
      commentErr,
      `Error creating support ticket comment: ${JSON.stringify(
        newSupportTicketComment,
      )}`,
    );
    return reply.internalServerError();
  }

  reply.cacheControl("private");
  reply.cacheControl("max-age", "5m");
  reply.stale("if-error", "1h");
  reply.vary("Cookie");

  log.debug(
    `Support ticket comment created successfully with id ${supportTicketComment.id}`,
  );

  await reply.server.cache.invalidateAll([
    supportTicketComment.ticketId,
    "support-tickets~all",
  ]);

  reply.statusCode = 201;

  return supportTicketComment;
}
