import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { ONE_WEEK } from "~/lib/constants.js";
import { redis } from "~/lib/redis.js";

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

  const announcements = await preparedStatement.execute();

  return { announcements, count: announcements.length };
}

// All platform announcements are accessible by admins only
// This query is used in the admin dashboard
export async function getAllAnnouncementsCached() {
  const cacheKey = `platformAnnouncements:all`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const announcements = await getAllAnnouncements();
  if (announcements.count > 0) {
    await redis.setex(cacheKey, JSON.stringify(announcements), ONE_WEEK);
  }

  return announcements;
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

  const announcement = await preparedStatement.execute({ id });

  return announcement;
}

// Individual platform announcements are accessible by admins only
// This query is used in the admin dashboard
export async function getAnnouncementByIdCached(id: string) {
  const cacheKey = `platformAnnouncement:id:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const announcement = await getAnnouncementById(id);
  if (announcement) {
    await redis.setex(cacheKey, JSON.stringify(announcement), ONE_WEEK);
  }

  return announcement;
}
