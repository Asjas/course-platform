import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

// ─── Notification Preferences ─────────────────────────────────────────────

export type NotificationPreference = Awaited<
  ReturnType<typeof trpcClient.notificationPreferences.getForUser.query>
>[number];

/**
 * Fetch all notification preference rows for a user.
 * Missing rows = preference is disabled (opt-in model).
 */
export function useNotificationPreferences({ userId }: { userId: string }) {
  return useQuery(
    trpc.notificationPreferences.getForUser.queryOptions({ userId }),
  );
}

/**
 * Save all notification preferences for a user in bulk.
 * Invalidates the getForUser query after saving.
 */
export async function saveNotificationPreferences({
  userId,
  preferences,
}: {
  userId: string;
  preferences: { key: string; enabled: boolean }[];
}) {
  try {
    await trpcClient.notificationPreferences.updateBulk.mutate({
      userId,
      preferences: preferences as { key: string; enabled: boolean }[],
    });
    await queryClient.invalidateQueries({
      queryKey: trpc.notificationPreferences.getForUser.queryKey({ userId }),
    });
    toast.success("Notification preferences saved");
  } catch (error) {
    console.error("Error saving notification preferences:", error);
    toast.error("Failed to save notification preferences");
    throw error;
  }
}
