import { and, eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  type SyncStatus,
  syncCollectionNames,
  syncStatus,
} from "~/db/schema/syncStatus.js";

/**
 * Get all sync statuses for a user
 */
export async function getSyncStatusesForUser(
  userId: string,
): Promise<SyncStatus[]> {
  return db.query.syncStatus.findMany({
    where: eq(syncStatus.userId, userId),
    orderBy: (syncStatus, { asc }) => [asc(syncStatus.collectionName)],
  });
}

/**
 * Get sync status for a specific user and collection
 */
export async function getSyncStatus(
  userId: string,
  collectionName: (typeof syncCollectionNames.enumValues)[number],
): Promise<SyncStatus | undefined> {
  return db.query.syncStatus.findFirst({
    where: and(
      eq(syncStatus.userId, userId),
      eq(syncStatus.collectionName, collectionName),
    ),
  });
}

export type AllSyncStatuses = Awaited<
  ReturnType<typeof getSyncStatusesForUser>
>;
export type SyncStatusResult = Awaited<ReturnType<typeof getSyncStatus>>;
