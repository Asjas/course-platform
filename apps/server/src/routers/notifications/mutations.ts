import { and, eq, isNull } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  type NewUserNotification,
  type UserNotification,
  userNotification,
} from "~/db/schema/userNotifications.js";

export async function insertUserNotification({
  newNotification,
}: {
  newNotification: NewUserNotification;
}) {
  const [result] = await db
    .insert(userNotification)
    .values(newNotification)
    .returning();

  return result;
}

export async function markNotificationAsRead({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) {
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
}

export async function markAllNotificationsAsRead({
  userId,
}: {
  userId: string;
}) {
  const result = await db
    .update(userNotification)
    .set({ readAt: new Date() })
    .where(
      and(eq(userNotification.userId, userId), isNull(userNotification.readAt)),
    )
    .returning();

  return result;
}

export async function deleteNotification({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) {
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
}

export async function updateNotification({
  notificationId,
  updates,
}: {
  notificationId: string;
  updates: Partial<UserNotification>;
}) {
  const [result] = await db
    .update(userNotification)
    .set({ ...updates })
    .where(eq(userNotification.id, notificationId))
    .returning();

  return result;
}
