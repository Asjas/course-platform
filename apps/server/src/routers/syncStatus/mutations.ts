import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import {
  type NewSyncStatus,
  syncCollectionNames,
  syncStatus,
} from "~/db/schema/syncStatus.js";

/**
 * Upsert sync status for a user and collection
 */
export async function upsertSyncStatus({
  userId,
  collectionName,
  lastSyncedAt,
  lastEventId,
  syncState,
  pendingUpdates,
  errorMessage,
  isOnline,
}: {
  userId: string;
  collectionName: (typeof syncCollectionNames.enumValues)[number];
  lastSyncedAt?: Date | null;
  lastEventId?: string | null;
  syncState?: "synced" | "syncing" | "offline" | "error";
  pendingUpdates?: number;
  errorMessage?: string | null;
  isOnline?: boolean;
}) {
  const existing = await db.query.syncStatus.findFirst({
    where: and(
      eq(syncStatus.userId, userId),
      eq(syncStatus.collectionName, collectionName),
    ),
  });

  if (existing) {
    const [updated] = await db
      .update(syncStatus)
      .set({
        lastSyncedAt: lastSyncedAt ?? existing.lastSyncedAt,
        lastEventId: lastEventId ?? existing.lastEventId,
        syncState: syncState ?? existing.syncState,
        pendingUpdates: pendingUpdates ?? existing.pendingUpdates,
        errorMessage: errorMessage ?? existing.errorMessage,
        isOnline: isOnline ?? existing.isOnline,
        updatedAt: new Date(),
      })
      .where(eq(syncStatus.id, existing.id))
      .returning();

    return updated;
  }

  const newStatus: NewSyncStatus = {
    id: ulid(),
    userId,
    collectionName,
    lastSyncedAt,
    lastEventId,
    syncState: syncState ?? "synced",
    pendingUpdates: pendingUpdates ?? 0,
    errorMessage,
    isOnline: isOnline ?? true,
  };

  const [inserted] = await db.insert(syncStatus).values(newStatus).returning();
  return inserted;
}

/**
 * Update online status for all collections of a user
 */
export async function updateOnlineStatus(userId: string, isOnline: boolean) {
  await db
    .update(syncStatus)
    .set({
      isOnline,
      syncState: isOnline ? "synced" : "offline",
      updatedAt: new Date(),
    })
    .where(eq(syncStatus.userId, userId));
}

/**
 * Delete sync status for a user (used for cleanup/GDPR)
 */
export async function deleteSyncStatusForUser(userId: string) {
  await db.delete(syncStatus).where(eq(syncStatus.userId, userId));
}
