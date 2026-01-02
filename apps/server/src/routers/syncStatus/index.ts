import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { syncCollectionNames } from "~/db/schema/syncStatus.js";
import { pinoLogger } from "~/lib/logging.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";
import {
  updateOnlineStatus,
  upsertSyncStatus,
} from "~/routers/syncStatus/mutations.js";
import {
  type AllSyncStatuses,
  getSyncStatus,
  getSyncStatusesForUser,
} from "~/routers/syncStatus/queries.js";

const log = pinoLogger.child({ module: "routers:syncStatus" });

// Sync state schema
const syncStateSchema = z.enum(["synced", "syncing", "offline", "error"]);

// Collection name schema using the enum values
const collectionNameSchema = z.enum(syncCollectionNames.enumValues);

export const syncStatusRouter = router({
  /**
   * Get all sync statuses for the current user
   */
  getAll: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }): Promise<AllSyncStatuses> => {
      try {
        return await getSyncStatusesForUser(ctx.user.id);
      } catch (error) {
        log.error(error, "Failed to get sync statuses");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get sync statuses",
        });
      }
    }),

  /**
   * Get sync status for a specific collection
   */
  getByCollection: publicProcedure
    .input(
      z.object({
        collectionName: collectionNameSchema,
      }),
    )
    .use(isAuthenticated)
    .query(async ({ ctx, input }) => {
      try {
        return await getSyncStatus(ctx.user.id, input.collectionName);
      } catch (error) {
        log.error(error, "Failed to get sync status");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get sync status",
        });
      }
    }),

  /**
   * Update sync status for a collection
   */
  update: publicProcedure
    .input(
      z.object({
        collectionName: collectionNameSchema,
        lastSyncedAt: z.date().nullable().optional(),
        lastEventId: z.string().nullable().optional(),
        syncState: syncStateSchema.optional(),
        pendingUpdates: z.number().optional(),
        errorMessage: z.string().nullable().optional(),
        isOnline: z.boolean().optional(),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }) => {
      try {
        return await upsertSyncStatus({
          userId: ctx.user.id,
          collectionName: input.collectionName,
          lastSyncedAt: input.lastSyncedAt,
          lastEventId: input.lastEventId,
          syncState: input.syncState,
          pendingUpdates: input.pendingUpdates,
          errorMessage: input.errorMessage,
          isOnline: input.isOnline,
        });
      } catch (error) {
        log.error(error, "Failed to update sync status");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update sync status",
        });
      }
    }),

  /**
   * Update online status for all collections
   */
  setOnlineStatus: publicProcedure
    .input(
      z.object({
        isOnline: z.boolean(),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }) => {
      try {
        await updateOnlineStatus(ctx.user.id, input.isOnline);
        return { success: true };
      } catch (error) {
        log.error(error, "Failed to update online status");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update online status",
        });
      }
    }),
});
