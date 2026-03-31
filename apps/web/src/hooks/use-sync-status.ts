import { eq, useLiveQuery } from "@tanstack/react-db";
import { SyncStatusCollection } from "~/collections/sync-status";

export function useSyncStatuses() {
  return useLiveQuery(SyncStatusCollection);
}

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
