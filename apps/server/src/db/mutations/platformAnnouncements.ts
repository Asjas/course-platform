import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  platformAnnouncement,
  platformAnnouncementRead,
} from "~/db/schema/platformAnnouncements.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:platform" });

export type PlatformAnnouncement = typeof platformAnnouncement.$inferSelect;
export type NewPlatformAnnouncement = typeof platformAnnouncement.$inferInsert;
export type PlatformAnnouncementRead =
  typeof platformAnnouncementRead.$inferSelect;
export type NewPlatformAnnouncementRead =
  typeof platformAnnouncementRead.$inferInsert;

export async function insertPlatformAnnouncement({
  newPlatformAnnouncement,
}: {
  newPlatformAnnouncement: NewPlatformAnnouncement;
}) {
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

export async function updatePlatformAnnouncementById({
  id,
  updates,
}: {
  id: string;
  updates: Partial<PlatformAnnouncement>;
}) {
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

export async function deletePlatformAnnouncementById(id: string) {
  try {
    const result = await db
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
  id: string,
  {
    announcementId,
    userId,
  }: {
    announcementId: string;
    userId: string;
  },
) {
  try {
    const result = await db
      .insert(platformAnnouncementRead)
      .values({
        id,
        announcementId,
        userId,
        readAt: new Date(),
      })
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert platform announcement read");

    throw err;
  }
}

export async function updatePlatformAnnouncementReadById({
  id,
  updates,
}: {
  id: string;
  updates: Partial<PlatformAnnouncementRead>;
}) {
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
