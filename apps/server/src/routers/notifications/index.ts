import { TRPCError } from "@trpc/server";
import * as z from "zod";
import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "~/db/mutations/userNotifications.js";
import {
  getNotificationById,
  getReadNotificationsForUser,
  getUnreadNotificationsForUser,
} from "~/db/queries/userNotifications.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

export const notificationsRouter = router({
  getUnreadForUser: publicProcedure
    .input(z.string())
    .query(async ({ input: userId }) => {
      try {
        const notifications = await getUnreadNotificationsForUser(userId);
        return notifications;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch unread notifications",
        });
      }
    }),

  getReadForUser: publicProcedure
    .input(z.string())
    .query(async ({ input: userId }) => {
      try {
        const notifications = await getReadNotificationsForUser(userId);
        return notifications;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch read notifications",
        });
      }
    }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: notificationId }) => {
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
    }),

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
});
