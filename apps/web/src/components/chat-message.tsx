import type { ChatMessage } from "@apps/server/src/routers/chat";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { EllipsisIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Menu,
  Button as MenuButton,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { toast } from "sonner";
import { useAuth } from "~/lib/auth.context";
import { renderMarkdown } from "~/lib/markdown";
import { getChannelCacheKey, queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";

export default function ChatMessage({
  msg,
  channelId,
}: {
  msg: ChatMessage;
  channelId: string;
}) {
  const [html, setHtml] = useState("");
  const auth = useAuth();

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

  const handleDelete = () => {
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
  };

  const handleEdit = () => {
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
  };

  return (
    <div className="group flex items-center gap-2 rounded-md py-1.5 hover:bg-gray-900/55">
      {/* timestamp */}
      <div className="flex w-14 justify-end">
        <span className="text-[14px] text-gray-300/75">
          {format(msg.timestamp, "HH:mm")}
        </span>
      </div>

      {/* message body + three-dot button */}
      <div className="flex flex-1 items-center gap-1">
        <span className="shrink-0 text-sm font-medium text-green-600">
          {msg.username || msg.name}:
        </span>

        <div
          className="flex-1 text-sm text-white"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* three-dot button – visible only on hover */}
        <MenuTrigger>
          <MenuButton
            className="mr-2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-700"
            aria-label="Message actions"
          >
            <EllipsisIcon
              size={18}
              color="var(--color-gray-400)"
            />
          </MenuButton>

          <Popover className="z-50">
            <Menu className="min-w-[120px] rounded-md border border-gray-700 bg-gray-800 p-1 text-sm shadow-lg">
              {auth.session?.user.name === msg.name || auth.hasRole("admin") ? (
                <MenuItem
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-200 hover:bg-gray-700"
                  onAction={handleEdit}
                >
                  Edit
                </MenuItem>
              ) : null}
              {auth.session?.user.name === msg.name || auth.hasRole("admin") ? (
                <MenuItem
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-red-400 hover:bg-gray-700"
                  onAction={handleDelete}
                >
                  Delete
                </MenuItem>
              ) : null}
            </Menu>
          </Popover>
        </MenuTrigger>
      </div>
    </div>
  );
}
