import type { FastifyReply, FastifyRequest } from "fastify";
import {
  type NewSupportTicket,
  insertSupportTicket,
} from "~/routes/support-tickets/mutations.js";

export async function createSupportTicketHandler(
  request: FastifyRequest<{
    Body: { newSupportTicket: NewSupportTicket };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:support-tickets:create",
  });

  const fastify = request.server;
  const { newSupportTicket } = request.body;

  if (!newSupportTicket) {
    log.debug("No support ticket data provided in request body");
    return reply.badRequest("No support ticket data provided in request body");
  }

  const [err, supportTicket] = await fastify.to(
    insertSupportTicket({ newSupportTicket }),
  );

  if (err) {
    log.error(
      err,
      `Error creating support ticket: ${JSON.stringify(newSupportTicket)}`,
    );
    return reply.internalServerError();
  }

  reply.cacheControl("private");
  reply.cacheControl("max-age", "5m");
  reply.stale("if-error", "1h");
  reply.vary("Cookie");

  log.debug(`Support ticket created successfully with id ${supportTicket.id}`);

  await reply.server.cache.invalidateAll(["support-tickets~all"]);

  reply.statusCode = 201;

  return supportTicket;
}
