import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./mutations.js";
import {
  type NotificationById,
  type ReadNotifications,
  type UnreadNotifications,
  getNotificationById,
  getReadNotificationsForUser,
  getUnreadNotificationsForUser,
} from "./queries.js";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { pinoLogger } from "~/lib/logging.js";
import {
  type EntitySyncUpdate,
  getEntityUpdatesSince,
  notificationsSyncConfig,
  streamEntityUpdates,
} from "~/lib/sse-sync.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

const log = pinoLogger.child({ module: "routers:notifications" });

// Export type for frontend use
export type NotificationSyncUpdate = EntitySyncUpdate<
  UnreadNotifications[number]
>;

export const notificationsRouter = router({
  getUnreadForUser: publicProcedure
    .input(z.string())
    .use(isAuthenticated)
    .query(async ({ input: userId }): Promise<UnreadNotifications> => {
      try {
        const notifications = await getUnreadNotificationsForUser(userId);

        return notifications;
      } catch (error) {
        log.error(error, "Failed to fetch unread notifications");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch unread notifications",
        });
      }
    }),
  getReadForUser: publicProcedure
    .input(z.string())
    .use(isAuthenticated)
    .query(async ({ input: userId }): Promise<ReadNotifications> => {
      try {
        const notifications = await getReadNotificationsForUser(userId);

        return notifications;
      } catch (error) {
        log.error(error, "Failed to fetch read notifications");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch read notifications",
        });
      }
    }),
  getById: publicProcedure
    .input(z.string())
    .use(isAuthenticated)
    .query(
      async ({
        input: notificationId,
      }): Promise<NonNullable<NotificationById>> => {
        try {
          const notification = await getNotificationById(notificationId);

          if (!notification) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Notification not found",
            });
          }

          return notification;
        } catch (error) {
          if (error instanceof TRPCError) throw error;

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch notification",
          });
        }
      },
    ),
  markAsRead: publicProcedure
    .input(
      z.object({
        notificationId: z.string(),
        userId: z.string(),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ input }) => {
      try {
        const result = await markNotificationAsRead({
          notificationId: input.notificationId,
          userId: input.userId,
        });

        return result;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notification as read",
        });
      }
    }),
  markAllAsRead: publicProcedure
    .input(z.object({ userId: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ input }) => {
      try {
        const result = await markAllNotificationsAsRead({
          userId: input.userId,
        });

        return { count: result.length };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark all notifications as read",
        });
      }
    }),
  delete: publicProcedure
    .input(
      z.object({
        notificationId: z.string(),
        userId: z.string(),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ input }) => {
      try {
        const result = await deleteNotification({
          notificationId: input.notificationId,
          userId: input.userId,
        });

        return result;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete notification",
        });
      }
    }),

  /**
   * Subscribe to real-time notification updates via SSE.
   * Clients receive updates when notifications are created for the user.
   * Uses user-scoped stream to only receive relevant notifications.
   */
  subscribeToUpdates: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAuthenticated)
    .subscription(async function* ({ input, ctx }) {
      // Ensure user can only subscribe to their own notifications
      if (ctx.user.id !== input.userId && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot subscribe to other users' notifications",
        });
      }

      yield* streamEntityUpdates<UnreadNotifications[number]>(
        notificationsSyncConfig,
        input.lastEventId,
        input.userId, // User-scoped stream
      );
    }),

  /**
   * Get notification updates since a specific timestamp.
   * Useful for syncing offline clients that have been disconnected.
   */
  getUpdatesSince: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        since: z.number(), // Timestamp in ms
      }),
    )
    .use(isAuthenticated)
    .query(async ({ input, ctx }) => {
      // Ensure user can only fetch their own notifications
      if (ctx.user.id !== input.userId && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot fetch other users' notifications",
        });
      }

      try {
        const updates = await getEntityUpdatesSince<
          UnreadNotifications[number]
        >(
          notificationsSyncConfig,
          input.since,
          input.userId, // User-scoped stream
        );
        return updates;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch notification updates",
        });
      }
    }),
});
