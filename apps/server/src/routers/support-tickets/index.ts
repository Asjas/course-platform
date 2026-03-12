import { TRPCError } from "@trpc/server";
import * as z from "zod";
import config from "~/config.js";
import type {
  NewSupportTicket,
  NewSupportTicketComment,
  SupportTicket,
  SupportTicketComment,
} from "~/db/schema/support-tickets.js";
import {
  dispatchNotification,
  notifyAdminNewSupportTicket,
} from "~/lib/notifications.js";
import {
  type EntitySyncUpdate,
  createSyncUpdate,
  getEntityUpdatesSince,
  publishEntityChange,
  streamEntityUpdates,
  supportTicketsSyncConfig,
} from "~/lib/sse-sync.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";
import {
  deleteSupportTicketById,
  insertSupportTicket,
  insertSupportTicketComment,
  updateSupportTicketById,
} from "~/routers/support-tickets/mutations.js";
import {
  type AllSupportTickets,
  type SupportTicketById,
  getSupportTicketById,
  getSupportTicketCountsByCourse,
} from "~/routers/support-tickets/queries.js";

export type SupportTicketSyncUpdate = EntitySyncUpdate<SupportTicket>;

export const supportTicketsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }): Promise<AllSupportTickets> => {
    const fastify = ctx.reply.server;

    const [err, allTickets] = await fastify.to(
      fastify.cache.getAllSupportTickets(),
    );

    if (err) {
      ctx.request.log.error(err, "Failed to get support tickets");

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
    }

    // Support tickets are completely public. No authentication required.
    const tickets = allTickets;

    ctx.request.log.debug(
      `Retrieved ${tickets.length} support tickets from cache/db`,
    );

    return tickets;
  }),
  getSupportTicketCountsByCourse: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }) => {
      const fastify = ctx.reply.server;

      // Only admins can see counts across all courses
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view ticket counts",
        });
      }

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

        // Support tickets are completely public. No authentication required.
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

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          supportTicketsSyncConfig,
          createSyncUpdate("created", newTicket.id, newTicket, ctx.user.id),
        );
      } catch (sseErr) {
        ctx.request.log.error(
          sseErr,
          "Failed to publish support ticket to SSE",
        );
      }

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

      // Dispatch notification for ticket owner (respects user preferences)
      try {
        const ticket = await getSupportTicketById({ ticketId: input.ticketId });

        if (ticket && ticket.userId !== ctx.user.id) {
          // Truncate comment for notification message (max 100 chars)
          const truncatedComment =
            input.comment.length > 100
              ? input.comment.slice(0, 100) + "..."
              : input.comment;

          await dispatchNotification({
            userId: ticket.userId,
            baseKey: "support:ticket_comment",
            browserNotification: {
              type: "support_ticket_comment",
              title: `New comment on your ticket: ${ticket.title}`,
              message: `${ctx.user.name} commented: "${truncatedComment}"`,
              link: `/support/${input.ticketId}`,
              supportTicketId: input.ticketId,
              actorId: ctx.user.id,
            },
            emailNotification: {
              subject: `New comment on your support ticket: ${ticket.title}`,
              text: `${ctx.user.name} commented on your support ticket "${ticket.title}":\n\n"${truncatedComment}"\n\nView ticket: ${ticket.id}`,
            },
          });

          ctx.request.log.debug(
            `Dispatched notification for ticket owner ${ticket.userId} about comment on ticket ${input.ticketId}`,
          );
        }
      } catch (notificationErr) {
        // Log but don't fail the request if notification creation fails
        ctx.request.log.error(
          notificationErr,
          "Failed to dispatch notification for ticket comment",
        );
      }

      return newComment;
    }),
  updateSupportTicket: publicProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z
          .enum(["open", "in_progress", "resolved", "closed"])
          .optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedToUserId: z.string().nullable().optional(),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }): Promise<SupportTicket> => {
      const fastify = ctx.reply.server;
      const isAdminUser = ctx.user.role === "admin";

      const existingTicket = await getSupportTicketById({
        ticketId: input.ticketId,
      });

      if (!existingTicket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Support ticket not found",
        });
      }

      // Only the ticket owner or an admin can update the ticket
      if (existingTicket.userId !== ctx.user.id && !isAdminUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this ticket",
        });
      }

      const { ticketId, ...updates } = input;
      const [err, updatedTicket] = await fastify.to(
        updateSupportTicketById({ ticketId, updates }),
      );

      if (err) {
        ctx.request.log.error(err, "Failed to update support ticket");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        `support-ticket~id~${ticketId}`,
        "support-ticket~all",
      ]);

      // Publish status change to SSE stream
      try {
        await publishEntityChange(
          supportTicketsSyncConfig,
          createSyncUpdate(
            "updated",
            updatedTicket.id,
            updatedTicket,
            ctx.user.id,
          ),
        );
      } catch (sseErr) {
        ctx.request.log.error(sseErr, "Failed to publish ticket update to SSE");
      }

      // Notify ticket owner when ticket is closed or resolved
      const isClosed =
        (input.status === "closed" || input.status === "resolved") &&
        existingTicket.status !== input.status;

      if (isClosed && existingTicket.userId !== ctx.user.id) {
        try {
          const statusLabel = input.status === "closed" ? "closed" : "resolved";
          await dispatchNotification({
            userId: existingTicket.userId,
            baseKey: "support:ticket_closed",
            browserNotification: {
              type: "support_ticket_resolved",
              title: `Your ticket has been ${statusLabel}`,
              message: `Support ticket "${existingTicket.title}" has been marked as ${statusLabel}.`,
              link: `/support/${existingTicket.id}`,
              supportTicketId: existingTicket.id,
              actorId: ctx.user.id,
            },
            emailNotification: {
              subject: `Your support ticket has been ${statusLabel}: ${existingTicket.title}`,
              text: `Your support ticket "${existingTicket.title}" has been marked as ${statusLabel}.\n\nIf you have any follow-up questions, please open a new ticket.`,
            },
          });
        } catch (notifErr) {
          ctx.request.log.error(
            notifErr,
            "Failed to dispatch ticket closed notification",
          );
        }
      }

      return updatedTicket;
    }),
  deleteSupportTicket: publicProcedure
    .input(z.object({ ticketId: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }): Promise<SupportTicket> => {
      const fastify = ctx.reply.server;
      const isAdmin = ctx.user.role === "admin";

      // Check if user owns the ticket or is admin before deleting
      const existingTicket = await getSupportTicketById({
        ticketId: input.ticketId,
      });

      if (!existingTicket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Support ticket not found",
        });
      }

      if (existingTicket.userId !== ctx.user.id && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete this ticket",
        });
      }

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

      // Publish deletion to SSE stream
      try {
        await publishEntityChange(
          supportTicketsSyncConfig,
          createSyncUpdate("deleted", input.ticketId, null, ctx.user.id),
        );
      } catch (sseErr) {
        ctx.request.log.error(
          sseErr,
          "Failed to publish support ticket deletion to SSE",
        );
      }

      return deletedTicket;
    }),

  /**
   * Subscribe to real-time support ticket updates via SSE.
   * Clients receive updates when tickets are created or deleted.
   */
  subscribeToUpdates: publicProcedure
    .input(
      z.object({
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAuthenticated)
    .subscription(async function* ({ input }) {
      yield* streamEntityUpdates<SupportTicket>(
        supportTicketsSyncConfig,
        input.lastEventId,
      );
    }),

  /**
   * Get support ticket updates since a specific timestamp.
   * Useful for syncing offline clients that have been disconnected.
   */
  getUpdatesSince: publicProcedure
    .input(
      z.object({
        since: z.number(), // Timestamp in ms
      }),
    )
    .use(isAuthenticated)
    .query(async ({ input }) => {
      try {
        const updates = await getEntityUpdatesSince<SupportTicket>(
          supportTicketsSyncConfig,
          input.since,
        );
        return updates;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch support ticket updates",
        });
      }
    }),
});
