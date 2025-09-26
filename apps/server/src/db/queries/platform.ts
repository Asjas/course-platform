import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
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
