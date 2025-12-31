import type { ChatMessage } from "@apps/server/src/routers/chat";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { getChannelCacheKey, queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";

/**
 * Custom hook for toggling emoji reactions on chat messages.
 * Centralizes the mutation and cache update logic to avoid duplication.
 */
export function useToggleReaction(channelId: string) {
  const toggleReactionMutation = useMutation(
    trpc.chat.toggleReaction.mutationOptions({ keyPrefix: undefined }),
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const result = await toggleReactionMutation.mutateAsync({
          messageId,
          emoji,
        });

        // Update the message in the cache with the new reactions
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
    [channelId, toggleReactionMutation],
  );

  return {
    toggleReaction,
    isLoading: toggleReactionMutation.isPending,
  };
}
