import { and, eq, isNull } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  type NewUserNotification,
  type UserNotification,
  userNotification,
} from "~/db/schema/userNotifications.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:userNotifications" });

export async function insertUserNotification({
  newNotification,
}: {
  newNotification: NewUserNotification;
}) {
  try {
    const [result] = await db
      .insert(userNotification)
      .values(newNotification)
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert user notification");
    throw err;
  }
}

export async function markNotificationAsRead({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) {
  try {
    const [result] = await db
      .update(userNotification)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(userNotification.id, notificationId),
          eq(userNotification.userId, userId),
        ),
      )
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to mark notification ${notificationId} as read`);
    throw err;
  }
}

export async function markAllNotificationsAsRead({
  userId,
}: {
  userId: string;
}) {
  try {
    const result = await db
      .update(userNotification)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(userNotification.userId, userId),
          isNull(userNotification.readAt),
        ),
      )
      .returning();

    return result;
  } catch (err) {
    log.error(
      err,
      `Failed to mark all notifications as read for user ${userId}`,
    );
    throw err;
  }
}

export async function deleteNotification({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) {
  try {
    const [result] = await db
      .delete(userNotification)
      .where(
        and(
          eq(userNotification.id, notificationId),
          eq(userNotification.userId, userId),
        ),
      )
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to delete notification ${notificationId}`);
    throw err;
  }
}

export async function updateNotification({
  notificationId,
  updates,
}: {
  notificationId: string;
  updates: Partial<UserNotification>;
}) {
  try {
    const [result] = await db
      .update(userNotification)
      .set({ ...updates })
      .where(eq(userNotification.id, notificationId))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update notification ${notificationId}`);
    throw err;
  }
}
