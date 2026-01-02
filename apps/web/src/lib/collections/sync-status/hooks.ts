/**
 * Sync Status Hooks
 *
 * React hooks for accessing the sync status collection.
 */
import { SyncStatusCollection } from "./sync-status.collection";
import { eq, useLiveQuery } from "@tanstack/react-db";

/**
 * Get all sync statuses.
 * Uses the offline-first collection.
 */
export function useSyncStatuses() {
  return useLiveQuery(SyncStatusCollection);
}

/**
 * Get sync status for a specific collection.
 * Returns the status from the offline collection.
 */
export function useSyncStatusByCollection({
  collectionName,
}: {
  collectionName: string;
}) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ syncStatus: SyncStatusCollection })
        .where(({ syncStatus }) =>
          eq(syncStatus.collectionName, collectionName),
        )
        .findOne();
    },
    [collectionName],
  );
}
