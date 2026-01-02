/**
 * Announcements Collection
 *
 * Offline-first collection for platform announcements.
 * User-specific read/unread status is handled via React Query
 * as these are user-scoped queries.
 */
import type { PublishedAnnouncements } from "@apps/server/src/db/queries/platformAnnouncements";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { ulid } from "ulid";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

// Announcement type from server - exported for use in components
export type Announcement = PublishedAnnouncements[number];

/**
 * Platform announcements collection.
 * Read-only for users - announcements are created by admins.
 */
export const AnnouncementsCollection = createCollection(
  queryCollectionOptions<Announcement>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.announcements.getPublished.queryKey(),
    queryFn: () => trpcClient.announcements.getPublished.query(),
  }),
);

/**
 * Mark an announcement as read for a user.
 * Invalidates both the published collection and user-specific queries.
 */
export async function markAnnouncementAsRead({
  announcementId,
  userId,
}: {
  announcementId: string;
  userId: string;
}) {
  try {
    await trpcClient.announcements.markAsRead.mutate({
      id: ulid(),
      announcementId,
      userId,
    });

    // Invalidate both the published collection and user-specific queries
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: trpc.announcements.getPublished.queryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.announcements.getUnreadForUser.queryKey(userId),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.announcements.getReadForUser.queryKey(userId),
      }),
    ]);

    toast.success("Announcement dismissed");
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    toast.error("Failed to dismiss announcement");
    throw error;
  }
}
