import type { ChatMessage, Reaction } from "@apps/server/src/routers/chat";
import { useMutation } from "@tanstack/react-query";
import { Tooltip, TooltipTrigger } from "react-aria-components";
import { toast } from "sonner";
import { EmojiReactionPicker } from "~/components/emoji-reaction-picker";
import { useAuth } from "~/lib/auth.context";
import { getChannelCacheKey, queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";

interface MessageReactionsProps {
  messageId: string;
  channelId: string;
  reactions?: Reaction[];
}

export function MessageReactions({
  messageId,
  channelId,
  reactions = [],
}: MessageReactionsProps) {
  const auth = useAuth();
  const currentUserId = auth.session?.user.id;

  const toggleReactionMutation = useMutation(
    trpc.chat.toggleReaction.mutationOptions({
      keyPrefix: undefined,
    }),
  );

  async function handleToggleReaction(emoji: string) {
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
  }

  // Check if the current user has reacted with a specific emoji
  function hasUserReacted(reaction: Reaction): boolean {
    return reaction.users.some((user) => user.userId === currentUserId);
  }

  // Format tooltip text showing users who reacted
  function getReactionTooltip(reaction: Reaction): string {
    const userNames = reaction.users.map((u) => u.userName);
    if (userNames.length === 0) return "";
    if (userNames.length === 1) return userNames[0];
    if (userNames.length === 2) return `${userNames[0]} and ${userNames[1]}`;
    if (userNames.length === 3)
      return `${userNames[0]}, ${userNames[1]}, and ${userNames[2]}`;
    return `${userNames[0]}, ${userNames[1]}, and ${userNames.length - 2} others`;
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {reactions.map((reaction) => (
        <TooltipTrigger
          key={reaction.emoji}
          delay={300}
        >
          <button
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors ${
              hasUserReacted(reaction)
                ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            type="button"
            onClick={() => handleToggleReaction(reaction.emoji)}
            aria-label={`${reaction.emoji} reaction from ${getReactionTooltip(reaction)}. Click to ${hasUserReacted(reaction) ? "remove" : "add"} your reaction.`}
          >
            <span aria-hidden="true">{reaction.emoji}</span>
            <span className="text-xs font-medium">{reaction.users.length}</span>
          </button>
          <Tooltip className="rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-gray-100 dark:text-gray-900">
            {getReactionTooltip(reaction)}
          </Tooltip>
        </TooltipTrigger>
      ))}
      <EmojiReactionPicker onEmojiSelect={handleToggleReaction} />
    </div>
  );
}
