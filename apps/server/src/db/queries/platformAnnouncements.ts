import { and, eq, isNotNull, isNull, not, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  platformAnnouncement,
  platformAnnouncementRead,
} from "~/db/schema/platformAnnouncements.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:queries:platform" });

// All platform announcements are accessible by admins only
// This query is used in the admin dashboard
export async function getAllAnnouncements() {
  const preparedStatement = db.query.platformAnnouncement
    .findMany({
      with: {
        author: true,
        reads: true,
      },
    })
    .prepare("getAllAnnouncements");

  try {
    const announcements = await preparedStatement.execute();

    return { announcements, count: announcements.length };
  } catch (err) {
    log.error(err, "Failed to get all announcements");
    throw err;
  }
}

// Individual platform announcements are accessible by admins only
// This query is used in the admin dashboard
export async function getAnnouncementById(id: string) {
  const preparedStatement = db.query.platformAnnouncement
    .findFirst({
      where: (announcement) => eq(announcement.id, sql.placeholder("id")),
      with: {
        author: true,
        reads: true,
      },
    })
    .prepare("getAnnouncementById");

  try {
    const announcement = await preparedStatement.execute({ id });

    return announcement;
  } catch (err) {
    log.error(err, `Failed to get announcement with id ${id}`);
    throw err;
  }
}

// Get published announcements for users
export async function getPublishedAnnouncements() {
  try {
    const announcements = await db.query.platformAnnouncement.findMany({
      where: isNotNull(platformAnnouncement.publishedAt),
      orderBy: (announcement, { desc }) => [desc(announcement.publishedAt)],
      with: {
        author: true,
      },
    });

    return announcements;
  } catch (err) {
    log.error(err, "Failed to get published announcements");
    throw err;
  }
}

// Get unread published announcements for a specific user
export async function getUnreadAnnouncementsForUser(userId: string) {
  const preparedStatement = db
    .select()
    .from(platformAnnouncement)
    .leftJoin(
      platformAnnouncementRead,
      and(
        eq(platformAnnouncementRead.announcementId, platformAnnouncement.id),
        eq(platformAnnouncementRead.userId, sql.placeholder("userId")),
      ),
    )
    .where(
      and(
        isNotNull(platformAnnouncement.publishedAt),
        isNull(platformAnnouncementRead.id),
      ),
    )
    .orderBy(platformAnnouncement.publishedAt)
    .prepare("getUnreadAnnouncementsForUser");

  try {
    const result = await preparedStatement.execute({ userId });
    return result.map((row) => row.platform_announcement);
  } catch (err) {
    log.error(err, `Failed to get unread announcements for user ${userId}`);
    throw err;
  }
}

// Get read announcements for a specific user
export async function getReadAnnouncementsForUser(userId: string) {
  const preparedStatement = db
    .select()
    .from(platformAnnouncement)
    .innerJoin(
      platformAnnouncementRead,
      and(
        eq(platformAnnouncementRead.announcementId, platformAnnouncement.id),
        eq(platformAnnouncementRead.userId, sql.placeholder("userId")),
      ),
    )
    .where(isNotNull(platformAnnouncement.publishedAt))
    .orderBy(platformAnnouncementRead.readAt)
    .prepare("getReadAnnouncementsForUser");

  try {
    const result = await preparedStatement.execute({ userId });
    return result.map((row) => ({
      ...row.platform_announcement,
      readAt: row.platform_announcement_read.readAt,
    }));
  } catch (err) {
    log.error(err, `Failed to get read announcements for user ${userId}`);
    throw err;
  }
}
