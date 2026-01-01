import type { ChatMessage } from "@apps/server/src/routers/chat";
import { useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "~/lib/auth.context";
import { getChannelCacheKey, queryClient } from "~/lib/query.client";
import { trpcClient } from "~/lib/trpc.client";

/**
 * Custom hook for toggling emoji reactions on chat messages.
 * Reactions are managed through the collection mutation handlers.
 */
export function useToggleReaction(channelId: string) {
  const auth = useAuth();
  const currentUserId = auth.session?.user.id;
  const currentUserName = auth.session?.user.name;

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!currentUserId || !currentUserName) {
        toast.error("You must be logged in to react.");
        return;
      }

      try {
        // Call the mutation which handles the toggle logic
        const result = await trpcClient.chat.toggleReaction.mutate({
          messageId,
          emoji,
        });

        // Update the message cache with the new reactions
        const cacheKey = getChannelCacheKey(channelId);
        queryClient.setQueryData<ChatMessage[]>(cacheKey, (prev = []) => {
          return prev.map((message) =>
            message.id === messageId
              ? { ...message, reactions: result }
              : message,
          );
        });
      } catch (error) {
        console.error("Error toggling reaction:", error);
        toast.error("Failed to update reaction.");
      }
    },
    [channelId, currentUserId, currentUserName],
  );

  return {
    toggleReaction,
    isLoading: false,
  };
}
