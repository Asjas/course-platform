import type { PublishedAnnouncements } from "@apps/server/src/db/queries/platformAnnouncements";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

// Announcement type from server - exported for use in components
export type Announcement = PublishedAnnouncements[number];

export const AnnouncementsCollection = createCollection(
  queryCollectionOptions<Announcement>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.announcements.getPublished.queryKey(),
    queryFn: () => trpcClient.announcements.getPublished.query(),
  }),
);
