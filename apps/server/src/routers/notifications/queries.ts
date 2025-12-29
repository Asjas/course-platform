import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { userNotification } from "~/db/schema/userNotifications.js";

export type UnreadNotifications = Awaited<
  ReturnType<typeof getUnreadNotificationsForUser>
>;
export type ReadNotifications = Awaited<
  ReturnType<typeof getReadNotificationsForUser>
>;
export type NotificationById = Awaited<ReturnType<typeof getNotificationById>>;
export type UserNotificationWithRelations = UnreadNotifications[number];

const preparedGetUnreadNotificationsForUser = db.query.userNotification
  .findMany({
    where: and(
      eq(userNotification.userId, sql.placeholder("userId")),
      isNull(userNotification.readAt),
    ),
    orderBy: [desc(userNotification.createdAt)],
    with: {
      actor: true,
      supportTicket: true,
    },
  })
  .prepare("getUnreadNotificationsForUser");

const preparedGetReadNotificationsForUser = db.query.userNotification
  .findMany({
    where: and(
      eq(userNotification.userId, sql.placeholder("userId")),
      isNotNull(userNotification.readAt),
    ),
    orderBy: [desc(userNotification.readAt)],
    with: {
      actor: true,
      supportTicket: true,
    },
    limit: 50, // Limit read notifications to prevent large payloads
  })
  .prepare("getReadNotificationsForUser");

const preparedGetNotificationById = db.query.userNotification
  .findFirst({
    where: eq(userNotification.id, sql.placeholder("notificationId")),
    with: {
      actor: true,
      supportTicket: true,
    },
  })
  .prepare("getNotificationById");

export async function getUnreadNotificationsForUser(userId: string) {
  const notifications = await preparedGetUnreadNotificationsForUser.execute({
    userId,
  });
  return notifications;
}

export async function getReadNotificationsForUser(userId: string) {
  const notifications = await preparedGetReadNotificationsForUser.execute({
    userId,
  });
  return notifications;
}

export async function getNotificationById(notificationId: string) {
  const notification = await preparedGetNotificationById.execute({
    notificationId,
  });
  return notification;
}
