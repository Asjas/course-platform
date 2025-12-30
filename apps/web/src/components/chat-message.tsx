import type { ChatMessage } from "@apps/server/src/routers/chat";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { EllipsisIcon, FlagIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Menu,
  Button as MenuButton,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { toast } from "sonner";
import { ReportMessageDialog } from "~/components/report-message-dialog";
import UserProfileSheet from "~/components/user-profile-sheet";
import { useAuth } from "~/lib/auth.context";
import { renderMarkdown } from "~/lib/markdown";
import { getChannelCacheKey, queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";

// Slack-like color palette for usernames
const USERNAME_COLORS = [
  "rgb(143, 74, 43)", // Warm brown
  "rgb(67, 118, 27)", // Green
  "rgb(77, 94, 38)", // Olive
  "rgb(125, 65, 76)", // Mauve
  "rgb(59, 134, 134)", // Teal
  "rgb(142, 68, 173)", // Purple
  "rgb(41, 128, 185)", // Blue
  "rgb(192, 57, 43)", // Red
  "rgb(211, 84, 0)", // Orange
  "rgb(22, 160, 133)", // Cyan
];

// Generate a consistent color based on username hash
function getUsernameColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  const index = Math.abs(hash) % USERNAME_COLORS.length;
  return USERNAME_COLORS[index];
}

export default function ChatMessage({
  msg,
  channelId,
}: {
  msg: ChatMessage;
  channelId: string;
}) {
  const [html, setHtml] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const auth = useAuth();

  const usernameColor = getUsernameColor(msg.name);

  const deleteMessageMutation = useMutation(
    trpc.chat.deleteMessage.mutationOptions({ keyPrefix: undefined }),
  );
  const editMessageMutation = useMutation(
    trpc.chat.editMessage.mutationOptions({ keyPrefix: undefined }),
  );

  useEffect(() => {
    renderMarkdown(msg.message)
      .then(setHtml)
      .catch((e) => {
        console.error(e);
        setHtml("<p>Error rendering message</p>");
      });
  }, [msg.message]);

  function handleEdit() {
    const newText = prompt("Edit message:", msg.message);

    if (newText !== null && newText !== msg.message) {
      editMessageMutation.mutate(
        { id: msg.id, message: newText },
        {
          onSuccess(updatedMessage) {
            const cacheKey = getChannelCacheKey(channelId);

            queryClient.setQueryData<ChatMessage[]>(cacheKey, (prev = []) => {
              return prev.map((message) =>
                message.id === msg.id ? updatedMessage : message,
              );
            });

            toast.info("Message edited successfully.");
          },
          onError(error) {
            console.error("Error editing message:", error);
            toast.error("Failed to edit message.");
          },
        },
      );
    }
  }

  function handleDelete() {
    deleteMessageMutation.mutate(
      { id: msg.id },
      {
        onSuccess() {
          const cacheKey = getChannelCacheKey(channelId);

          queryClient.setQueryData<ChatMessage[]>(cacheKey, (prev = []) => {
            return prev.filter((message) => message.id !== msg.id);
          });

          toast.success("Message deleted successfully.");
        },
        onError(error) {
          console.error("Error deleting message:", error);
          toast.error("Failed to delete message.");
        },
      },
    );
  }

  return (
    <>
      <div
        className="group relative flex items-start gap-2 rounded py-0.5 pr-2 pl-1 hover:bg-gray-100 dark:hover:bg-gray-900/55"
        role="article"
        aria-label={`Message from ${msg.username || msg.name}`}
      >
        {/* Compact timestamp column - Slack style */}
        <div className="flex w-12 shrink-0 items-start justify-end pt-0.5">
          <span
            className="text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-500"
            title={format(msg.timestamp, "PPpp")}
          >
            {format(msg.timestamp, "HH:mm")}
          </span>
        </div>

        {/* Message content area - Slack compact mode style */}
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5">
          {/* Username with unique color */}
          <button
            className="shrink-0 cursor-pointer text-sm font-bold hover:underline"
            style={{ color: usernameColor }}
            type="button"
            onClick={() => setIsProfileSheetOpen(true)}
          >
            {msg.username || msg.name}
          </button>

          {/* Message text - inline with username */}
          <div
            className="chat-message-content min-w-0 flex-1 text-sm text-gray-900 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {msg.editedAt ? (
            <span
              className="text-xs text-gray-400 dark:text-gray-500"
              title={`Edited ${format(msg.editedAt, "PPpp")}`}
            >
              (edited)
            </span>
          ) : null}
        </div>

        {/* Action menu - appears on hover, positioned at right edge */}
        <div className="absolute top-0 right-1 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
          <MenuTrigger>
            <MenuButton
              className="rounded border border-transparent bg-white p-1 shadow-sm hover:border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-700"
              aria-label="Message actions"
            >
              <EllipsisIcon
                className="text-gray-500 dark:text-gray-400"
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
