import type { ChatMessage, Reaction } from "@apps/server/src/routers/chat";
import { format } from "date-fns";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EllipsisIcon,
  FlagIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  Button as MenuButton,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { toast } from "sonner";
import { EmojiReactionPicker } from "~/components/emoji-reaction-picker";
import { MarkdownContent } from "~/components/markdown-content";
import { MessageReactions } from "~/components/message-reactions";
import { ReportMessageDialog } from "~/components/report-message-dialog";
import UserProfileSheet from "~/components/user-profile-sheet";
import { useAuth } from "~/lib/auth.context";
import { isMediaCollapsed, setMediaCollapsed } from "~/lib/collapsed-media";
import { renderMarkdown } from "~/lib/markdown";
import { trpcClient } from "~/lib/trpc.client";

// Default color for users without a precomputed color
const DEFAULT_USERNAME_COLOR = "rgb(41, 128, 185)"; // Blue

// Minimal interface for collection operations used by ChatMessage
interface MessageCollection {
  delete(id: string): void;
  update(
    id: string,
    callback: (draft: { message: string; reactions?: Reaction[] }) => void,
  ): void;
}

export default function ChatMessage({
  msg,
  channelId,
  collection,
}: {
  msg: ChatMessage;
  channelId: string;
  collection: MessageCollection;
}) {
  const [html, setHtml] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  // Initialize media visibility from persisted state (collapsed = not visible)
  const [isMediaVisible, setIsMediaVisible] = useState(
    () => !isMediaCollapsed(msg.id),
  );
  const auth = useAuth();

  // Use the precomputed color from the user's database record, with a fallback
  const usernameColor = msg.color || DEFAULT_USERNAME_COLOR;

  async function handleToggleReaction(emoji: string) {
    const currentUserId = auth.session?.user.id;
    const currentUserName = auth.session?.user.name;

    if (!currentUserId || !currentUserName) {
      toast.error("You must be logged in to react.");
      return;
    }

    // Optimistically update the reactions in the collection
    collection.update(msg.id, (draft) => {
      // Ensure reactions is initialized as an array
      if (!draft.reactions) {
        draft.reactions = [];
      }
      const reactions = draft.reactions;
      const existingReaction = reactions.find((r) => r.emoji === emoji);

      if (existingReaction) {
        const userIndex = existingReaction.users.findIndex(
          (u) => u.userId === currentUserId,
        );

        if (userIndex !== -1) {
          // User already reacted, remove their reaction
          existingReaction.users.splice(userIndex, 1);
          // If no users left for this emoji, remove the reaction entirely
          if (existingReaction.users.length === 0) {
            const reactionIndex = reactions.findIndex((r) => r.emoji === emoji);
            reactions.splice(reactionIndex, 1);
          }
        } else {
          // User hasn't reacted with this emoji yet, add them
          existingReaction.users.push({
            userId: currentUserId,
            userName: currentUserName,
          });
        }
      } else {
        // No reaction with this emoji exists, create it
        reactions.push({
          emoji,
          users: [{ userId: currentUserId, userName: currentUserName }],
        });
      }

      draft.reactions = reactions;
    });

    // Sync to server
    try {
      await trpcClient.chat.toggleReaction.mutate({
        messageId: msg.id,
        emoji,
      });
    } catch (error) {
      console.error("Error toggling reaction:", error);
      toast.error("Failed to update reaction.");
    }
  }

  useEffect(() => {
    renderMarkdown(msg.message)
      .then(setHtml)
      .catch((e) => {
        console.error(e);
        setHtml("<p>Error rendering message</p>");
      });
  }, [msg.message]);

  // Parse HTML to separate text content from media
  const { textHtml, mediaHtml, hasMedia, mediaLabel, isBlockContent } =
    useMemo(() => {
      if (!html)
        return {
          textHtml: "",
          mediaHtml: "",
          hasMedia: false,
          mediaLabel: "",
          isBlockContent: false,
        };

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Find all media elements (images, videos, iframes)
      const mediaElements = doc.querySelectorAll("img, video, iframe");
      const hasMedia = mediaElements.length > 0;

      // Determine media label
      let mediaLabel = "";
      if (hasMedia) {
        const firstMedia = mediaElements[0];
        if (firstMedia.tagName === "IMG") {
          const src = firstMedia.getAttribute("src") || "";
          if (src.includes("giphy") || src.includes(".gif")) {
            mediaLabel = "GIF";
          } else {
            mediaLabel = "image";
          }
        } else if (firstMedia.tagName === "VIDEO") {
          mediaLabel = "video";
        } else if (firstMedia.tagName === "IFRAME") {
          mediaLabel = "embed";
        }
        if (mediaElements.length > 1) {
          mediaLabel += ` +${mediaElements.length - 1}`;
        }
      }

      // Clone and remove media from text content
      const textDoc = doc.cloneNode(true) as Document;
      textDoc.querySelectorAll("img, video, iframe").forEach((el) => {
        // Also remove parent paragraph if it only contains the media
        const parent = el.parentElement;
        if (
          parent &&
          parent.tagName === "P" &&
          parent.childNodes.length === 1
        ) {
          parent.remove();
        } else {
          el.remove();
        }
      });

      // Create media-only HTML
      const mediaDoc = parser.parseFromString("<div></div>", "text/html");
      const mediaContainer = mediaDoc.body.firstChild as HTMLElement;
      mediaElements.forEach((el) => {
        mediaContainer.appendChild(el.cloneNode(true));
      });

      const textHtml = textDoc.body.innerHTML.trim();
      const mediaHtml = mediaContainer.innerHTML;

      // Check if content contains block-level elements (pre, blockquote, ul, ol, table, h1-h6)
      // If so, it should render below the username, not inline
      const blockElements = textDoc.body.querySelectorAll(
        "pre, blockquote, ul, ol, table, h1, h2, h3, h4, h5, h6",
      );
      const isBlockContent = blockElements.length > 0;

      return { textHtml, mediaHtml, hasMedia, mediaLabel, isBlockContent };
    }, [html]);

  function handleEdit() {
    const newText = prompt("Edit message:", msg.message);

    if (newText !== null && newText !== msg.message) {
      try {
        collection.update(msg.id, (draft) => {
          draft.message = newText;
        });
        toast.info("Message edited successfully.");
      } catch (error) {
        console.error("Error editing message:", error);
        toast.error("Failed to edit message.");
      }
    }
  }

  function handleDelete() {
    try {
      collection.delete(msg.id);
      toast.success("Message deleted successfully.");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message.");
    }
  }

  return (
    <>
      <div
        className="group relative flex gap-3 rounded-sm px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/30"
        role="article"
        aria-label={`Message from ${msg.username || msg.name}`}
      >
        {/* Timestamp column - Slack style */}
        <div className="flex w-10 shrink-0 items-start">
          <span
            className="mt-0.5 h-5 text-sm leading-5 text-gray-500 dark:text-gray-500"
            title={format(msg.timestamp, "PPpp")}
          >
            {format(msg.timestamp, "HH:mm")}
          </span>
        </div>

        {/* Message content area */}
        <div className="min-w-0 flex-1">
          {/* Username and inline content (for simple text messages) */}
          <div className="flex flex-wrap items-baseline gap-x-2">
            <button
              className="shrink-0 cursor-pointer text-sm leading-5 font-bold hover:underline"
              style={{ color: usernameColor }}
              type="button"
              onClick={() => setIsProfileSheetOpen(true)}
            >
              {msg.username || msg.name}
            </button>

            {/* Inline text content - only for simple paragraphs without block elements */}
            {textHtml && !isBlockContent ? (
              <span
                className="chat-message-content inline text-sm text-gray-900 dark:text-gray-100 [&_p]:m-0 [&_p]:inline"
                dangerouslySetInnerHTML={{ __html: textHtml }}
              />
            ) : null}

            {msg.editedAt ? (
              <span
                className="text-xs text-gray-400 dark:text-gray-500"
                title={`Edited ${format(msg.editedAt, "PPpp")}`}
              >
                (edited)
              </span>
            ) : null}
          </div>

          {/* Block content - renders below username for code blocks, lists, etc. */}
          {textHtml && isBlockContent ? (
            <div
              className="chat-message-content mt-1 text-sm text-gray-900 dark:text-gray-100 [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_pre]:my-2 [&_pre]:max-w-full [&_pre]:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: textHtml }}
            />
          ) : null}

          {/* Media section with collapse/expand */}
          {hasMedia ? (
            <div className={textHtml ? "mt-0.5" : ""}>
              {/* Media toggle button */}
              <button
                className="flex cursor-pointer items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                type="button"
                onClick={() => {
                  const newVisible = !isMediaVisible;
                  setIsMediaVisible(newVisible);
                  // Persist the collapsed state (collapsed = not visible)
                  setMediaCollapsed(msg.id, !newVisible);
                }}
                aria-expanded={isMediaVisible}
                aria-label={
                  isMediaVisible ? `Hide ${mediaLabel}` : `Show ${mediaLabel}`
                }
              >
                {isMediaVisible ? (
                  <ChevronDownIcon
                    size={14}
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronRightIcon
                    size={14}
                    aria-hidden="true"
                  />
                )}
                <span>{mediaLabel}</span>
              </button>

              {/* Collapsible media content - uses VideoPlayer for consistent styling */}
              {isMediaVisible ? (
                <MarkdownContent
                  className="chat-message-media [&_iframe]:max-w-md [&_iframe]:rounded [&_img]:max-w-md [&_img]:rounded"
                  html={mediaHtml}
                />
              ) : null}
            </div>
          ) : null}

          {/* Reactions */}
          <MessageReactions
            reactions={msg.reactions}
            onToggleReaction={handleToggleReaction}
            currentUserId={auth.session?.user.id}
            messageAuthor={msg.name}
          />
        </div>

        {/* Action menu - appears on hover or focus, positioned at right edge */}
        <div className="pointer-events-none absolute -top-3 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
          {/* Add reaction button */}
          <EmojiReactionPicker
            onEmojiSelect={handleToggleReaction}
            messageAuthor={msg.name}
          />

          <MenuTrigger>
            <MenuButton
              className="cursor-pointer rounded border border-gray-200 bg-white p-1 shadow-sm hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-label="Message actions"
              aria-haspopup="menu"
            >
              <EllipsisIcon
                className="text-gray-600 dark:text-gray-300"
                size={16}
              />
            </MenuButton>

            <Popover className="z-50">
              <Menu className="min-w-[140px] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {auth.session?.user.name === msg.name ||
                auth.hasRole("admin") ? (
                  <MenuItem
                    className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    onAction={handleEdit}
                  >
                    Edit
                  </MenuItem>
                ) : null}
                {auth.session?.user.name === msg.name ||
                auth.hasRole("admin") ? (
                  <MenuItem
                    className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-red-600 outline-none hover:bg-gray-100 focus:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    onAction={handleDelete}
                  >
                    Delete
                  </MenuItem>
                ) : null}
                {auth.session?.user.name !== msg.name ? (
                  <MenuItem
                    className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-orange-600 outline-none hover:bg-gray-100 focus:bg-gray-100 dark:text-orange-400 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    onAction={() => setIsReportDialogOpen(true)}
                  >
                    <FlagIcon size={14} />
                    Report
                  </MenuItem>
                ) : null}
              </Menu>
            </Popover>
          </MenuTrigger>
        </div>
      </div>

      <ReportMessageDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        messageId={msg.id}
        channelId={channelId}
        messageContent={msg.message}
        messageAuthor={msg.name}
      />

      <UserProfileSheet
        userName={msg.name}
        open={isProfileSheetOpen}
        onOpenChange={setIsProfileSheetOpen}
      />
    </>
  );
}
