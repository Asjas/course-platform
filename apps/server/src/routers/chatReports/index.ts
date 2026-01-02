import {
  deleteReportedMessageFromRedis,
  insertChatReport,
  updateReportStatus,
} from "./mutations.js";
import {
  type AllChatReports,
  type ChatReportById,
  getAllChatReports,
  getChatReportById,
} from "./queries.js";
import { TRPCError } from "@trpc/server";
import { ulid } from "ulid";
import * as z from "zod";
import type { ChatMessageReport } from "~/db/schema/chatMessageReports.js";
import { reportReason } from "~/db/schema/chatMessageReports.js";
import { pinoLogger } from "~/lib/logging.js";
import { notifyAdminChatMessageReported } from "~/lib/notifications.js";
import {
  type EntitySyncUpdate,
  chatReportsSyncConfig,
  createSyncUpdate,
  getEntityUpdatesSince,
  publishEntityChange,
  streamEntityUpdates,
} from "~/lib/sse-sync.js";
import { isAdmin, isAuthenticated, publicProcedure, router } from "~/router.js";

export type ChatReportSyncUpdate = EntitySyncUpdate<ChatMessageReport>;

const log = pinoLogger.child({ module: "routers:chatReports" });

export const chatReportsRouter = router({
  reportMessage: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        messageId: z.string(),
        channelId: z.string(),
        reason: z.enum(reportReason.enumValues),
        details: z.string().optional(),
        messageContent: z.string(),
        messageAuthor: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const report = await insertChatReport({
          id: ulid(),
          messageId: input.messageId,
          channelId: input.channelId,
          reportedBy: ctx.user.id,
          reason: input.reason,
          details: input.details || null,
          messageContent: input.messageContent,
          messageAuthor: input.messageAuthor,
          status: "pending",
          reviewedBy: null,
          reviewedAt: null,
        });

        // Notify admins
        await notifyAdminChatMessageReported({
          reportId: report.id,
          channelId: input.channelId,
          reporterName: ctx.user.name,
          reason: input.reason,
        });

        // Publish to SSE stream for real-time updates
        try {
          await publishEntityChange(
            chatReportsSyncConfig,
            createSyncUpdate("created", report.id, report, ctx.user.id),
          );
        } catch (sseErr) {
          log.error(sseErr, "Failed to publish chat report to SSE");
        }

        return report;
      } catch (error) {
        log.error(error, "Failed to create chat message report");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to report message",
        });
      }
    }),

  getAll: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .query(async (): Promise<AllChatReports> => {
      try {
        return await getAllChatReports();
      } catch (error) {
        log.error(error, "Failed to fetch chat reports");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch reports",
        });
      }
    }),

  getReportById: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(z.string())
    .query(
      async ({ input: reportId }): Promise<NonNullable<ChatReportById>> => {
        try {
          const report = await getChatReportById(reportId);
          if (!report) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Report not found",
            });
          }
          return report;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          log.error(error, "Failed to fetch chat report");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch report",
          });
        }
      },
    ),

  updateReportStatus: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(
      z.object({
        reportId: z.string(),
        status: z.enum(["reviewed", "dismissed", "actioned"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const report = await updateReportStatus({
          reportId: input.reportId,
          status: input.status,
          reviewedBy: ctx.user.id,
        });

        // Publish to SSE stream for real-time updates
        try {
          await publishEntityChange(
            chatReportsSyncConfig,
            createSyncUpdate("updated", report.id, report, ctx.user.id),
          );
        } catch (sseErr) {
          log.error(sseErr, "Failed to publish chat report update to SSE");
        }

        return report;
      } catch (error) {
        log.error(error, "Failed to update report status");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update report status",
        });
      }
    }),

  deleteReportedMessage: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(
      z.object({
        reportId: z.string(),
        messageId: z.string(),
        channelId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Delete message from Redis
        const deleted = await deleteReportedMessageFromRedis({
          messageId: input.messageId,
          channelId: input.channelId,
        });

        if (!deleted) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Message not found in channel",
          });
        }

        // Update report status to actioned
        await updateReportStatus({
          reportId: input.reportId,
          status: "actioned",
          reviewedBy: ctx.user.id,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        log.error(error, "Failed to delete reported message");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete message",
        });
      }
    }),

  /**
   * Subscribe to real-time chat report updates via SSE.
   * Admin-only: Clients receive updates when reports are created or updated.
   */
  subscribeToUpdates: publicProcedure
    .input(
      z.object({
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAuthenticated)
    .use(isAdmin)
    .subscription(async function* ({ input }) {
      yield* streamEntityUpdates<ChatMessageReport>(
        chatReportsSyncConfig,
        input.lastEventId,
      );
    }),

  /**
   * Get chat report updates since a specific timestamp.
   * Admin-only: Useful for syncing offline clients that have been disconnected.
   */
  getUpdatesSince: publicProcedure
    .input(
      z.object({
        since: z.number(), // Timestamp in ms
      }),
    )
    .use(isAuthenticated)
    .use(isAdmin)
    .query(async ({ input }) => {
      try {
        const updates = await getEntityUpdatesSince<ChatMessageReport>(
          chatReportsSyncConfig,
          input.since,
        );
        return updates;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat report updates",
        });
      }
    }),
});
