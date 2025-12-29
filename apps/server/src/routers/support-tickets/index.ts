import { TRPCError } from "@trpc/server";
import { ulid } from "ulid";
import * as z from "zod";
import config from "~/config.js";
import type {
  NewSupportTicket,
  NewSupportTicketComment,
  SupportTicket,
  SupportTicketComment,
} from "~/db/schema/support-tickets.js";
import { notifyAdminNewSupportTicket } from "~/lib/notifications.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";
import { insertUserNotification } from "~/routers/notifications/mutations.js";
import {
  deleteSupportTicketById,
  insertSupportTicket,
  insertSupportTicketComment,
} from "~/routers/support-tickets/mutations.js";
import {
  type AllSupportTickets,
  type SupportTicketById,
  getSupportTicketById,
  getSupportTicketCountsByCourse,
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
  getSupportTicketCountsByCourse: publicProcedure.query(async ({ ctx }) => {
    const fastify = ctx.reply.server;

    const [err, counts] = await fastify.to(getSupportTicketCountsByCourse());

    if (err) {
      ctx.request.log.error(err, "Failed to get support ticket counts");

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
    }

    ctx.request.log.debug(`Retrieved support ticket counts for courses`);

    // Convert Map to plain object for JSON serialization
    return Object.fromEntries(counts);
  }),
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

      // Send notification to admins after ticket is created
      try {
        await notifyAdminNewSupportTicket({
          ticketId: newTicket.id,
          ticketTitle: newTicket.title,
          submittedByName: ctx.user.name,
        });
      } catch (notificationErr) {
        // Log but don't fail the request
        ctx.request.log.error(
          notificationErr,
          "Failed to send admin notification for new support ticket",
        );
      }

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

      // Create notification for ticket owner if the commenter is not the owner
      try {
        const ticket = await getSupportTicketById({ ticketId: input.ticketId });

        if (ticket && ticket.userId !== ctx.user.id) {
          // Truncate comment for notification message (max 100 chars)
          const truncatedComment =
            input.comment.length > 100
              ? input.comment.slice(0, 100) + "..."
              : input.comment;

          await insertUserNotification({
            newNotification: {
              id: `notif:${ulid()}`,
              userId: ticket.userId,
              type: "support_ticket_comment",
              title: `New comment on your ticket: ${ticket.title}`,
              message: `${ctx.user.name} commented: "${truncatedComment}"`,
              link: `/support/${input.ticketId}`,
              supportTicketId: input.ticketId,
              actorId: ctx.user.id,
            },
          });

          ctx.request.log.debug(
            `Created notification for ticket owner ${ticket.userId} about comment on ticket ${input.ticketId}`,
          );
        }
      } catch (notificationErr) {
        // Log but don't fail the request if notification creation fails
        ctx.request.log.error(
          notificationErr,
          "Failed to create notification for ticket comment",
        );
      }

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
