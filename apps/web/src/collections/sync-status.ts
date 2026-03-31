import type { AllSyncStatuses } from "@apps/server/src/routers/syncStatus/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type SyncStatusItem = AllSyncStatuses[number];

export const SyncStatusCollection = createCollection(
  queryCollectionOptions<SyncStatusItem>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.syncStatus.getAll.queryKey(),
    queryFn: () => trpcClient.syncStatus.getAll.query(),
    onUpdate: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.syncStatus.update.mutate({
          collectionName: modified.collectionName,
          lastSyncedAt: modified.lastSyncedAt
            ? new Date(modified.lastSyncedAt)
            : null,
          lastEventId: modified.lastEventId,
          syncState: modified.syncState,
          pendingUpdates: modified.pendingUpdates,
          errorMessage: modified.errorMessage,
          isOnline: modified.isOnline,
        });
      } catch (error) {
        console.error("Error updating sync status: ", error);
        throw error;
      }
    },
  }),
);
