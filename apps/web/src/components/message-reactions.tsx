import type { Reaction } from "@apps/server/src/routers/chat";
import { Tooltip, TooltipTrigger } from "react-aria-components";
import { toast } from "sonner";
import { EmojiReactionPicker } from "~/components/emoji-reaction-picker";
import { useAuth } from "~/lib/auth.context";
import { toggleReactionViaCollection } from "~/lib/db.collections";

interface MessageReactionsProps {
  messageId: string;
  reactions?: Reaction[];
  /**
   * Name of the message author for accessible aria-label.
   */
  messageAuthor?: string;
}

export function MessageReactions({
  messageId,
  reactions = [],
  messageAuthor,
}: MessageReactionsProps) {
  const auth = useAuth();
  const currentUserId = auth.session?.user.id;
  const currentUserName = auth.session?.user.name;

  async function handleToggleReaction(emoji: string) {
    if (!currentUserId || !currentUserName) {
      toast.error("You must be logged in to react.");
      return;
    }

    toggleReactionViaCollection({
      messageId,
      emoji,
      userId: currentUserId,
      userName: currentUserName,
    });
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

  // Only show the reactions UI if there are reactions
  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {reactions.map((reaction) => (
        <TooltipTrigger
          key={reaction.emoji}
          delay={300}
        >
          <button
            className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-sm transition-colors ${
              hasUserReacted(reaction)
                ? "bg-blue-600/80 text-white hover:bg-blue-600"
                : "bg-gray-600/60 text-gray-200 hover:bg-gray-600/80"
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
      <EmojiReactionPicker
        onEmojiSelect={handleToggleReaction}
        variant="inline"
        messageAuthor={messageAuthor}
      />
    </div>
  );
}
