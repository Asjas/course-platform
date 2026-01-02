/**
 * Shared types for the offline-first collections architecture
 */

/**
 * Sync state for tracking offline updates and reconnection
 */
export interface SyncState {
  lastSyncTimestamp: number;
  isConnected: boolean;
  pendingUpdates: number;
  isSyncing: boolean;
}

/**
 * Entity sync update from the server.
 * This matches the server-side EntitySyncUpdate type.
 */
export interface EntitySyncUpdate<T> {
  id: string;
  type: "created" | "updated" | "deleted";
  data: T | null;
  entityId: string;
  timestamp: number;
  actorId?: string;
}
