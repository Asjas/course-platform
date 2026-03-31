import { useLiveQuery } from "@tanstack/react-db";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ulid } from "ulid";
import { AnnouncementsCollection } from "~/collections/announcements";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export function useAnnouncements() {
  return useLiveQuery(AnnouncementsCollection);
}

//Announcements Collection - User-specific queries
export function useUnreadAnnouncements({ userId }: { userId: string }) {
  return useQuery({
    ...trpc.announcements.getUnreadForUser.queryOptions(userId),
    refetchInterval: 30000, // Poll every 30 seconds for new announcements
    refetchIntervalInBackground: true,
  });
}

export function useReadAnnouncements({ userId }: { userId: string }) {
  return useQuery(trpc.announcements.getReadForUser.queryOptions(userId));
}

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
