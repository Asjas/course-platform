import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { userNotification } from "~/db/schema/userNotifications.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:queries:userNotifications" });

export type UserNotificationWithRelations = Awaited<
  ReturnType<typeof getUnreadNotificationsForUser>
>[number];

// Get unread notifications for a specific user
export async function getUnreadNotificationsForUser(userId: string) {
  const preparedStatement = db.query.userNotification
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

  try {
    const notifications = await preparedStatement.execute({ userId });
    return notifications;
  } catch (err) {
    log.error(err, `Failed to get unread notifications for user ${userId}`);
    throw err;
  }
}

// Get read notifications for a specific user
export async function getReadNotificationsForUser(userId: string) {
  const preparedStatement = db.query.userNotification
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

  try {
    const notifications = await preparedStatement.execute({ userId });
    return notifications;
  } catch (err) {
    log.error(err, `Failed to get read notifications for user ${userId}`);
    throw err;
  }
}

// Get a single notification by ID
export async function getNotificationById(notificationId: string) {
  const preparedStatement = db.query.userNotification
    .findFirst({
      where: eq(userNotification.id, sql.placeholder("notificationId")),
      with: {
        actor: true,
        supportTicket: true,
      },
    })
    .prepare("getNotificationById");

  try {
    const notification = await preparedStatement.execute({ notificationId });
    return notification;
  } catch (err) {
    log.error(err, `Failed to get notification with id ${notificationId}`);
    throw err;
  }
}
