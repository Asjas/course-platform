import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

// User Notifications - for support ticket comments and other user-specific notifications
export type UserNotification = Awaited<
  ReturnType<typeof trpcClient.notifications.getUnreadForUser.query>
>[number];

export function useUnreadUserNotifications({ userId }: { userId: string }) {
  return useQuery({
    ...trpc.notifications.getUnreadForUser.queryOptions(userId),
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
    refetchIntervalInBackground: true,
  });
}

export function useReadUserNotifications({ userId }: { userId: string }) {
  return useQuery(trpc.notifications.getReadForUser.queryOptions(userId));
}

export async function markUserNotificationAsRead({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) {
  try {
    await trpcClient.notifications.markAsRead.mutate({
      notificationId,
      userId,
    });

    // Invalidate user notification queries
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: trpc.notifications.getUnreadForUser.queryKey(userId),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.notifications.getReadForUser.queryKey(userId),
      }),
    ]);

    toast.success("Notification dismissed");
  } catch (error) {
    console.error("Error marking notification as read:", error);
    toast.error("Failed to dismiss notification");
    throw error;
  }
}
