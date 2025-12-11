import { TRPCError } from "@trpc/server";
import * as z from "zod";
import config from "~/config.js";
import type {
  NewSupportTicket,
  NewSupportTicketComment,
  SupportTicket,
  SupportTicketComment,
} from "~/db/schema/support-tickets.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";
import {
  deleteSupportTicketById,
  insertSupportTicket,
  insertSupportTicketComment,
} from "~/routers/support-tickets/mutations.js";
import type {
  AllSupportTickets,
  SupportTicketById,
} from "~/routers/support-tickets/queries.js";

export const supportTicketsRouter = router({
  getAllSupportTickets: publicProcedure.query(
    async ({ ctx }): Promise<AllSupportTickets> => {
      const fastify = ctx.reply.server;

      const [err, tickets] = await fastify.to(
        fastify.cache.getAllSupportTickets(),
      );

      if (err) {
        ctx.request.log.error(err, "Failed to get support tickets");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      ctx.request.log.debug(
        `Retrieved ${tickets.length} support tickets from cache/db`,
      );

      return tickets;
    },
  ),
  getSupportTicketById: publicProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(
      async ({
        ctx,
        input: { ticketId },
      }): Promise<SupportTicketById | null> => {
        const fastify = ctx.reply.server;

        const [err, ticket] = await fastify.to(
          fastify.cache.getSupportTicketById({ ticketId }),
        );

        if (err) {
          ctx.request.log.error(
            err,
            `Failed to get support ticket with id ${ticketId}`,
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          });
        }

        ctx.request.log.debug(
          `Retrieved support ticket with ID ${ticketId} from cache/db`,
        );

        return ticket;
      },
    ),
  createSupportTicket: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(5).max(100),
        description: z.string().max(1000),
        repo: z.string().nullable().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
        moduleId: z.string().nullable().optional(),
        lessonId: z.string().nullable().optional(),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }): Promise<SupportTicket> => {
      const fastify = ctx.reply.server;

      console.log("Creating support ticket with input:", input);

      const newSupportTicket: NewSupportTicket = {
        ...input,
        userId: ctx.user.id,
        assignedToUserId: config.SUPPORT_ASSIGNED_TO_USER_ID,
      };

      const [err, newTicket] = await fastify.to(
        insertSupportTicket({ newSupportTicket }),
      );

      if (err) {
        ctx.request.log.error(err, "Failed to create support ticket");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll(["support-ticket~all"]);

      ctx.request.log.debug(
        `Created new support ticket with ID ${newTicket.id}`,
      );

      return newTicket;
    }),
  createSupportTicketComment: publicProcedure
    .input(
      z.object({
        id: z.string(),
        ticketId: z.string(),
        comment: z.string().min(2),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }): Promise<SupportTicketComment> => {
      const fastify = ctx.reply.server;

      const newSupportTicketComment: NewSupportTicketComment = {
        id: input.id,
        ticketId: input.ticketId,
        userId: ctx.user.id,
        comment: input.comment,
      };

      const [err, newComment] = await fastify.to(
        insertSupportTicketComment({ newSupportTicketComment }),
      );

      if (err) {
        ctx.request.log.error(err, "Failed to create support comment");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        `support-ticket~id~${input.ticketId}`,
        "support-ticket~all",
      ]);

      ctx.request.log.debug(
        `Created new support comment with ID ${newComment.id} for ticket ID ${input.ticketId}`,
      );

      return newComment;
    }),
  deleteSupportTicket: publicProcedure
    .input(z.object({ ticketId: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }): Promise<SupportTicket> => {
      const fastify = ctx.reply.server;

      const [err, deletedTicket] = await fastify.to(
        deleteSupportTicketById({ ticketId: input.ticketId }),
      );

      if (err) {
        ctx.request.log.error(err, "Failed to delete support ticket");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        `support-ticket~id~${input.ticketId}`,
        "support-ticket~all",
      ]);

      ctx.request.log.debug(`Deleted support ticket with ID ${input.ticketId}`);

      return deletedTicket;
    }),
});
