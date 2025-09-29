import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
} from "fastify";
import {
  deleteSupportTicketAttachmentById,
  deleteSupportTicketById,
  deleteSupportTicketCommentById,
  insertSupportTicket,
  insertSupportTicketAttachment,
  insertSupportTicketComment,
  updateSupportTicketAttachmentById,
  updateSupportTicketById,
  updateSupportTicketCommentById,
} from "~/db/mutations/supportTickets.js";
import {
  getAllSupportTickets,
  getSupportTicketById,
} from "~/db/queries/supportTickets.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  FIVE_MINUTES,
  ONE_DAY,
} from "~/lib/constants.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "routes:support:private" });

export default function supportRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.get("/support-tickets", async (_request, reply) => {
    const supportTickets = await getAllSupportTickets();

    if (!supportTickets) {
      log.warn("No support tickets found");
      return reply.status(404).send({ error: "No support tickets found" });
    }

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: FIVE_MINUTES,
        staleIfError: ONE_DAY * 2,
      }),
    );

    log.info(
      { count: supportTickets.count },
      "Fetched all support tickets with private caching",
    );

    return supportTickets;
  });

  fastify.get(
    "/support-tickets/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params;

      try {
        const supportTicket = await getSupportTicketById(id);

        if (!supportTicket) {
          log.warn({ id }, "Support ticket not found");
          return reply.status(404).send({ error: "Support ticket not found" });
        }

        reply.headers(
          CACHE_PRIVATE_REVALIDATE({
            maxAge: ONE_DAY,
            staleIfError: ONE_DAY * 2,
          }),
        );

        log.info({ id }, "Fetched support ticket by ID with private caching");

        return supportTicket;
      } catch (error) {
        log.error({ err: error }, "Error fetching support ticket by ID");
        return reply
          .status(500)
          .send({ error: "Error fetching support ticket by ID" });
      }
    },
  );

  fastify.post(
    "/support-tickets",
    async (
      request: FastifyRequest<{ Body: { newSupportTicket: any } }>,
      reply,
    ) => {
      const { newSupportTicket } = request.body;

      try {
        const insertedSupportTicket =
          await insertSupportTicket(newSupportTicket);

        log.info(
          { id: insertedSupportTicket[0].id },
          "Inserted new support ticket",
        );

        return reply.status(201).send(insertedSupportTicket);
      } catch (error) {
        log.error({ err: error }, "Error inserting new support ticket");
        return reply
          .status(500)
          .send({ error: "Error inserting new support ticket" });
      }
    },
  );

  fastify.put(
    "/support-tickets/:id",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { updates: Partial<any> };
      }>,
      reply,
    ) => {
      const { id } = request.params;
      const { updates } = request.body;

      try {
        const updatedSupportTicket = await updateSupportTicketById({
          id,
          updates,
        });

        if (!updatedSupportTicket) {
          log.warn({ id }, "Support ticket not found for update");
          return reply.status(404).send({ error: "Support ticket not found" });
        }

        log.info({ id }, "Updated support ticket");

        return updatedSupportTicket;
      } catch (error) {
        log.error({ err: error }, "Error updating support ticket");
        return reply
          .status(500)
          .send({ error: "Error updating support ticket" });
      }
    },
  );

  fastify.delete(
    "/support-tickets/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params;

      try {
        const deletedSupportTicket = await deleteSupportTicketById(id);

        if (!deletedSupportTicket) {
          log.warn({ id }, "Support ticket not found for deletion");
          return reply.status(404).send({ error: "Support ticket not found" });
        }

        log.info({ id }, "Deleted support ticket");

        return reply.status(204).send();
      } catch (error) {
        log.error({ err: error }, "Error deleting support ticket");
        return reply
          .status(500)
          .send({ error: "Error deleting support ticket" });
      }
    },
  );

  fastify.post(
    "/support-tickets/:ticketId/comments",
    async (
      request: FastifyRequest<{
        Params: { ticketId: string };
        Body: { newSupportTicketComment: any };
      }>,
      reply,
    ) => {
      const { ticketId } = request.params;
      const { newSupportTicketComment } = request.body;

      try {
        const insertedComment = await insertSupportTicketComment({
          ...newSupportTicketComment,
          ticketId,
        });

        log.info(
          { id: insertedComment[0].id, ticketId },
          "Inserted new support ticket comment",
        );

        return reply.status(201).send(insertedComment);
      } catch (error) {
        log.error({ err: error }, "Error inserting support ticket comment");
        return reply
          .status(500)
          .send({ error: "Error inserting support ticket comment" });
      }
    },
  );

  fastify.put(
    "/support-tickets/comments/:id",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { updates: Partial<any> };
      }>,
      reply,
    ) => {
      const { id } = request.params;
      const { updates } = request.body;

      try {
        const updatedComment = await updateSupportTicketCommentById({
          id,
          updates,
        });

        if (!updatedComment) {
          log.warn({ id }, "Support ticket comment not found for update");
          return reply
            .status(404)
            .send({ error: "Support ticket comment not found" });
        }

        log.info({ id }, "Updated support ticket comment");

        return updatedComment;
      } catch (error) {
        log.error({ err: error }, "Error updating support ticket comment");
        return reply
          .status(500)
          .send({ error: "Error updating support ticket comment" });
      }
    },
  );

  fastify.delete(
    "/support-tickets/comments/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params;

      try {
        const deletedSupportTicketComment =
          await deleteSupportTicketCommentById(id);

        if (!deletedSupportTicketComment) {
          log.warn({ id }, "Support ticket comment not found for deletion");
          return reply
            .status(404)
            .send({ error: "Support ticket comment not found" });
        }

        log.info({ id }, "Deleted support ticket comment");

        return reply.status(204).send();
      } catch (error) {
        log.error({ err: error }, "Error deleting support ticket comment");
        return reply
          .status(500)
          .send({ error: "Error deleting support ticket comment" });
      }
    },
  );

  fastify.post(
    "/support-tickets/:ticketId/attachments",
    async (
      request: FastifyRequest<{
        Params: { ticketId: string };
        Body: { newSupportTicketAttachment: any };
      }>,
      reply,
    ) => {
      const { ticketId } = request.params;
      const { newSupportTicketAttachment } = request.body;

      try {
        const insertedAttachment = await insertSupportTicketAttachment({
          newSupportTicketAttachment: {
            ...newSupportTicketAttachment,
            ticketId,
          },
        });

        log.info(
          { id: insertedAttachment[0].id, ticketId },
          "Inserted new support ticket attachment",
        );

        return reply.status(201).send(insertedAttachment);
      } catch (error) {
        log.error({ err: error }, "Error inserting support ticket attachment");
        return reply
          .status(500)
          .send({ error: "Error inserting support ticket attachment" });
      }
    },
  );

  fastify.put(
    "/support-tickets/attachments/:id",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { updates: Partial<any> };
      }>,
      reply,
    ) => {
      const { id } = request.params;
      const { updates } = request.body;

      try {
        const updatedAttachment = await updateSupportTicketAttachmentById({
          id,
          updates,
        });
        if (!updatedAttachment) {
          log.warn({ id }, "Support ticket attachment not found for update");
          return reply
            .status(404)
            .send({ error: "Support ticket attachment not found" });
        }

        log.info({ id }, "Updated support ticket attachment");

        return updatedAttachment;
      } catch (error) {
        log.error({ err: error }, "Error updating support ticket attachment");
        return reply
          .status(500)
          .send({ error: "Error updating support ticket attachment" });
      }
    },
  );

  fastify.delete(
    "/support-tickets/attachments/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params;

      try {
        const deletedSupportTicketAttachment =
          await deleteSupportTicketAttachmentById(id);

        if (!deletedSupportTicketAttachment) {
          log.warn({ id }, "Support ticket attachment not found for deletion");
          return reply
            .status(404)
            .send({ error: "Support ticket attachment not found" });
        }

        log.info({ id }, "Deleted support ticket attachment");

        return reply.status(204).send();
      } catch (error) {
        log.error({ err: error }, "Error deleting support ticket attachment");
        return reply
          .status(500)
          .send({ error: "Error deleting support ticket attachment" });
      }
    },
  );

  done();
}
