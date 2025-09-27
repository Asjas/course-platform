import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  platformAnnouncement,
  platformAnnouncementRead,
} from "~/db/schema/platform.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:platform" });

export type platformAnnouncement = typeof platformAnnouncement.$inferSelect;
export type newPlatformAnnouncement = typeof platformAnnouncement.$inferInsert;
export type platformAnnouncementRead =
  typeof platformAnnouncementRead.$inferSelect;
export type newPlatformAnnouncementRead =
  typeof platformAnnouncementRead.$inferInsert;

export async function insertPlatformAnnouncement(
  newPlatformAnnouncement: newPlatformAnnouncement,
) {
  try {
    const result = await db
      .insert(platformAnnouncement)
      .values(newPlatformAnnouncement)
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert platform announcement");

    throw err;
  }
}

export async function updatePlatformAnnouncementById(
  id: string,
  updates: Partial<platformAnnouncement>,
) {
  try {
    const result = await db
      .update(platformAnnouncement)
      .set({ ...updates })
      .where(eq(platformAnnouncement.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update platform announcement with id ${id}`);
    throw err;
  }
}

export async function deletePlatformAnnouncementById({
  id,
}: platformAnnouncement) {
  try {
    const result = db
      .delete(platformAnnouncement)
      .where(eq(platformAnnouncement.id, id))
      .returning({ id: platformAnnouncement.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete platform announcement with id ${id}`);
    throw err;
  }
}

export async function insertPlatformAnnouncementRead(
  newPlatformAnnouncementRead: newPlatformAnnouncementRead,
) {
  try {
    const result = await db
      .insert(platformAnnouncementRead)
      .values(newPlatformAnnouncementRead)
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert platform announcement read");

    throw err;
  }
}

export async function updatePlatformAnnouncementReadById(
  id: string,
  updates: Partial<platformAnnouncementRead>,
) {
  try {
    const result = await db
      .update(platformAnnouncementRead)
      .set({ ...updates })
      .where(eq(platformAnnouncementRead.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update platform announcement read with id ${id}`);
    throw err;
  }
}
