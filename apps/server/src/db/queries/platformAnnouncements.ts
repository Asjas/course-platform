import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  platformAnnouncement,
  platformAnnouncementRead,
} from "~/db/schema/platformAnnouncements.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:queries:platform" });

// Type exports for announcement queries
export type AllAnnouncements = Awaited<ReturnType<typeof getAllAnnouncements>>;
export type AnnouncementById = Awaited<ReturnType<typeof getAnnouncementById>>;
export type PublishedAnnouncements = Awaited<
  ReturnType<typeof getPublishedAnnouncements>
>;
export type UnreadAnnouncementsForUser = Awaited<
  ReturnType<typeof getUnreadAnnouncementsForUser>
>;
export type ReadAnnouncementsForUser = Awaited<
  ReturnType<typeof getReadAnnouncementsForUser>
>;

// Module-scoped prepared statements
const preparedGetAllAnnouncements = db.query.platformAnnouncement
  .findMany({
    with: {
      author: true,
      reads: true,
    },
  })
  .prepare("getAllAnnouncements");

const preparedGetAnnouncementById = db.query.platformAnnouncement
  .findFirst({
    where: (announcement) => eq(announcement.id, sql.placeholder("id")),
    with: {
      author: true,
      reads: true,
    },
  })
  .prepare("getAnnouncementById");

const preparedGetUnreadAnnouncementsForUser = db
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

const preparedGetReadAnnouncementsForUser = db
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

// All platform announcements are accessible by admins only
// This query is used in the admin dashboard
export async function getAllAnnouncements() {
  try {
    const announcements = await preparedGetAllAnnouncements.execute();

    return { announcements, count: announcements.length };
  } catch (err) {
    log.error(err, "Failed to get all announcements");
    throw err;
  }
}

// Individual platform announcements are accessible by admins only
// This query is used in the admin dashboard
export async function getAnnouncementById(id: string) {
  try {
    const announcement = await preparedGetAnnouncementById.execute({ id });

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
  try {
    const result = await preparedGetUnreadAnnouncementsForUser.execute({
      userId,
    });
    return result.map((row) => row.platform_announcement);
  } catch (err) {
    log.error(err, `Failed to get unread announcements for user ${userId}`);
    throw err;
  }
}

// Get read announcements for a specific user
export async function getReadAnnouncementsForUser(userId: string) {
  try {
    const result = await preparedGetReadAnnouncementsForUser.execute({
      userId,
    });
    return result.map((row) => ({
      ...row.platform_announcement,
      readAt: row.platform_announcement_read.readAt,
    }));
  } catch (err) {
    log.error(err, `Failed to get read announcements for user ${userId}`);
    throw err;
  }
}
