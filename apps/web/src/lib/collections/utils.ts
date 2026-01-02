/**
 * Sync utilities for offline-first data fetching
 */
import type { EntitySyncUpdate } from "./types";
import { createCollection } from "@tanstack/react-db";

// Storage key for tracking last sync timestamps per collection
const SYNC_STORAGE_KEY_PREFIX = "sync:lastTimestamp:";

/**
 * Get the last sync timestamp for a collection from localStorage.
 */
export function getLastSyncTimestamp(collectionName: string): number {
  const stored = localStorage.getItem(
    `${SYNC_STORAGE_KEY_PREFIX}${collectionName}`,
  );
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * Save the last sync timestamp for a collection to localStorage.
 */
export function setLastSyncTimestamp(
  collectionName: string,
  timestamp: number,
): void {
  localStorage.setItem(
    `${SYNC_STORAGE_KEY_PREFIX}${collectionName}`,
    timestamp.toString(),
  );
}

/**
 * Apply a sync update to a collection.
 * Handles created, updated, and deleted entity types.
 *
 * Note: This function is currently not used as we're using query invalidation
 * instead of direct collection updates for SSE sync. Kept for future use
 * if direct collection updates are needed.
 */
export function applySyncUpdate<T extends { id: string }>(
  collection: ReturnType<typeof createCollection<T>>,
  update: EntitySyncUpdate<T>,
): void {
  // Currently using query invalidation instead of direct collection updates
  // See useSseSync.ts hooks for the implementation
  console.debug(
    "applySyncUpdate called - using query invalidation instead",
    collection,
    update,
  );
}

/**
 * Sync pending updates for a collection that was offline.
 * Fetches all updates since the last sync timestamp and applies them.
 *
 * Note: This function is currently not used as we're using query invalidation
 * instead of direct collection updates for SSE sync. The useSseSync.ts hooks
 * handle offline sync by fetching updates and invalidating queries.
 */
export async function syncOfflineUpdates<T extends { id: string }>(
  collectionName: string,
  _collection: ReturnType<typeof createCollection<T>>,
  fetchUpdatesSince: (since: number) => Promise<EntitySyncUpdate<T>[]>,
): Promise<number> {
  const lastSync = getLastSyncTimestamp(collectionName);

  if (lastSync === 0) {
    // First sync - no history to fetch
    setLastSyncTimestamp(collectionName, Date.now());
    return 0;
  }

  try {
    const updates = await fetchUpdatesSince(lastSync);

    // Update last sync timestamp
    const latestTimestamp =
      updates.length > 0
        ? Math.max(...updates.map((u) => u.timestamp))
        : Date.now();
    setLastSyncTimestamp(collectionName, latestTimestamp);

    return updates.length;
  } catch (error) {
    console.error(`Error syncing ${collectionName} updates:`, error);
    throw error;
  }
}

// Export sync utilities as a namespace for convenience
export const syncUtils = {
  getLastSyncTimestamp,
  setLastSyncTimestamp,
  applySyncUpdate,
  syncOfflineUpdates,
};
