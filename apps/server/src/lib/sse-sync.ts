/**
 * SSE Sync Infrastructure
 *
 * This module provides utilities for real-time synchronization between
 * the backend and frontend using Server-Sent Events (SSE) via Redis Streams.
 *
 * Key concepts:
 * - Entities (support tickets, announcements, etc.) publish changes to Redis Streams
 * - Clients subscribe to these streams and receive real-time updates
 * - Offline clients can sync from a specific timestamp when reconnecting
 */
import { type TrackedEnvelope, tracked } from "@trpc/server";
import { ulid } from "ulid";
import { pinoLogger } from "~/lib/logging.js";
import { redis, subscriptionRedis } from "~/lib/redis.js";

const log = pinoLogger.child({ module: "sse-sync" });

/**
 * Entity change types for sync operations.
 */
export type EntityChangeType = "created" | "updated" | "deleted";

/**
 * Base interface for entity sync updates.
 * All entity-specific updates extend this.
 */
export interface EntitySyncUpdate<T> {
  /** Unique ID for the update (for deduplication) */
  id: string;
  /** Type of change */
  type: EntityChangeType;
  /** The entity data (null for deletions) */
  data: T | null;
  /** Entity ID (useful for deletions where data is null) */
  entityId: string;
  /** Timestamp of the change */
  timestamp: number;
  /** User ID who made the change (if applicable) */
  actorId?: string;
}

/**
 * Configuration for entity sync streams.
 */
export interface EntitySyncConfig {
  /** Base stream key prefix (e.g., "sync:announcements") */
  streamKeyPrefix: string;
  /** Maximum entries to keep in the stream (default: 10000) */
  maxStreamLength?: number;
  /** Block timeout for XREAD in ms (default: 5000) */
  blockTimeout?: number;
}

/**
 * Generate a stream key for an entity type.
 * For global streams (all users), use just the prefix.
 * For user-specific streams, append the userId.
 */
export function getEntityStreamKey(
  config: EntitySyncConfig,
  scope?: string,
): string {
  if (scope) {
    return `${config.streamKeyPrefix}:${scope}`;
  }
  return config.streamKeyPrefix;
}

/**
 * Publish an entity change to a Redis Stream.
 * This is called from mutations when entities are created/updated/deleted.
 *
 * @example
 * ```ts
 * await publishEntityChange(
 *   announcementsConfig,
 *   { id: ulid(), type: "created", data: announcement, entityId: announcement.id, timestamp: Date.now() }
 * );
 * ```
 */
export async function publishEntityChange<T>(
  config: EntitySyncConfig,
  update: EntitySyncUpdate<T>,
  scope?: string,
): Promise<string> {
  const streamKey = getEntityStreamKey(config, scope);
  const maxLen = config.maxStreamLength ?? 10000;

  try {
    const streamId = await redis.xadd(
      streamKey,
      "MAXLEN",
      "~",
      String(maxLen),
      "*",
      "data",
      JSON.stringify(update),
    );

    if (!streamId) {
      throw new Error("Failed to add entry to stream - no streamId returned");
    }

    log.debug(
      { streamKey, updateId: update.id, streamId },
      "Published entity change to stream",
    );

    return streamId;
  } catch (error) {
    log.error({ error, streamKey, update }, "Failed to publish entity change");
    throw error;
  }
}

/**
 * Safely parse JSON with error handling.
 * Returns null if parsing fails instead of throwing.
 */
export function safeJsonParse<T>(json: string, context?: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    log.error(
      { error, json: json.slice(0, 100), context },
      "Failed to parse JSON",
    );
    return null;
  }
}

/**
 * Check if a stream ID is after another (for ordering).
 */
export function isStreamIdAfter(current: string, previous: string): boolean {
  if (previous === "$") return true;
  if (previous === "0") return true;

  const [cTime, cSeq] = current.split("-").map(Number);
  const [pTime, pSeq] = previous.split("-").map(Number);

  return cTime > pTime || (cTime === pTime && cSeq > pSeq);
}

/**
 * Create an async generator for streaming entity updates.
 * This is used to implement tRPC subscription endpoints.
 *
 * @example
 * ```ts
 * // In a tRPC router:
 * subscribeToAnnouncements: publicProcedure
 *   .input(z.object({ lastEventId: z.string().nullish() }))
 *   .subscription(async function* ({ input }) {
 *     yield* streamEntityUpdates<Announcement>(announcementsConfig, input.lastEventId);
 *   }),
 * ```
 */
export async function* streamEntityUpdates<T>(
  config: EntitySyncConfig,
  lastEventId?: string | null,
  scope?: string,
): AsyncGenerator<TrackedEnvelope<EntitySyncUpdate<T>>> {
  const streamKey = getEntityStreamKey(config, scope);
  const blockTimeout = config.blockTimeout ?? 5000;

  // Start from lastEventId, or from $ (latest) if not provided
  let lastId = lastEventId ?? "$";

  while (true) {
    try {
      const result = await subscriptionRedis.xread(
        "COUNT",
        100,
        "BLOCK",
        blockTimeout,
        "STREAMS",
        streamKey,
        lastId,
      );

      if (!result?.length) continue;

      const [[, entries]] = result;

      for (const [streamId, fields] of entries) {
        // Skip if not newer (safety check)
        if (lastId !== "$" && !isStreamIdAfter(streamId, lastId)) continue;

        const payload = safeJsonParse<EntitySyncUpdate<T>>(
          fields[1],
          `streamEntityUpdates:${config.streamKeyPrefix}`,
        );
        if (!payload) continue; // Skip corrupted data

        // Update lastId
        lastId = streamId;

        // Yield using tracked() for tRPC deduplication
        yield tracked(payload.id, payload);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("Invalid stream ID")) {
        lastId = "$"; // Fallback to latest
        continue;
      }
      // Wait before retrying on error
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Get historical updates from a stream since a given timestamp.
 * This is useful for syncing offline clients that have been
 * disconnected for a period of time.
 *
 * @param config - Entity sync configuration
 * @param since - Timestamp (in ms) to start from
 * @param scope - Optional scope for the stream key
 * @returns Array of updates since the given timestamp
 */
export async function getEntityUpdatesSince<T>(
  config: EntitySyncConfig,
  since: number,
  scope?: string,
): Promise<EntitySyncUpdate<T>[]> {
  const streamKey = getEntityStreamKey(config, scope);

  try {
    // Convert timestamp to Redis stream ID format (timestamp-0)
    const startId = `${since}-0`;

    const entries = await redis.xrange(streamKey, startId, "+");

    const updates: EntitySyncUpdate<T>[] = [];

    for (const [, fields] of entries) {
      const payload = safeJsonParse<EntitySyncUpdate<T>>(
        fields[1],
        `getEntityUpdatesSince:${config.streamKeyPrefix}`,
      );
      if (payload) {
        updates.push(payload);
      }
    }

    log.debug(
      { streamKey, since, count: updates.length },
      "Retrieved entity updates since timestamp",
    );

    return updates;
  } catch (error) {
    log.error(
      { error, streamKey, since },
      "Failed to get entity updates since timestamp",
    );
    throw error;
  }
}

/**
 * Helper to create a sync update object.
 */
export function createSyncUpdate<T>(
  type: EntityChangeType,
  entityId: string,
  data: T | null,
  actorId?: string,
): EntitySyncUpdate<T> {
  return {
    id: ulid(),
    type,
    data,
    entityId,
    timestamp: Date.now(),
    actorId,
  };
}

// ========== Pre-configured Entity Sync Configs ==========

export const announcementsSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:announcements",
  maxStreamLength: 10000,
};

export const notificationsSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:notifications",
  maxStreamLength: 50000, // Higher limit as notifications are per-user
};

export const supportTicketsSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:support-tickets",
  maxStreamLength: 10000,
};

export const couponsSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:coupons",
  maxStreamLength: 5000,
};

export const reviewsSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:reviews",
  maxStreamLength: 10000,
};

export const coursesSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:courses",
  maxStreamLength: 5000,
};

export const chatReportsSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:chat-reports",
  maxStreamLength: 5000,
};

export const searchableUsersSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:searchable-users",
  maxStreamLength: 10000,
};
