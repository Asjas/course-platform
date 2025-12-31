import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { MessageCircleIcon, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DMRequestModal } from "~/components/dm-request-modal";
import { UserSearchModal } from "~/components/user-search-modal";
import { trpc } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/chat")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/chat" || location.pathname === "/chat/") {
      throw redirect({
        to: "/chat/$channelId",
        params: { channelId: "general" },
      });
    }
  },
  component: AuthenticatedChatPage,
});

const channels = ["general", "random"];

function AuthenticatedChatPage() {
  const navigate = useNavigate();
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const [isDMRequestModalOpen, setIsDMRequestModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  // Fetch active DM conversations
  const { data: dmConversations, refetch: refetchDmConversations } = useQuery(
    trpc.directMessages.getActiveConversations.queryOptions(),
  );

  const closeConversationMutation = useMutation(
    trpc.directMessages.closeConversation.mutationOptions({
      keyPrefix: undefined,
    }),
  );

  async function handleSelectUser(userId: string, userName: string) {
    // Check if conversation already exists
    const existingConversation = dmConversations?.find(
      (conv) => conv.user1Id === userId || conv.user2Id === userId,
    );

    if (existingConversation) {
      // Navigate to existing conversation
      navigate({
        to: "/chat/dm/$conversationId",
        params: { conversationId: existingConversation.id },
      });
    } else {
      // Show DM request modal
      setSelectedUserId(userId);
      setSelectedUserName(userName);
      setIsUserSearchOpen(false);
      setIsDMRequestModalOpen(true);
    }
  }

  async function handleCloseDM(conversationId: string) {
    try {
      await closeConversationMutation.mutateAsync({ conversationId });
      await refetchDmConversations();
      toast.success("Conversation closed");
    } catch (error) {
      console.error("Failed to close DM conversation:", conversationId, error);
      toast.error("Failed to close conversation");
    }
  }

  function handleDMRequestClose() {
    setIsDMRequestModalOpen(false);
    setSelectedUserId("");
    setSelectedUserName("");
    // Refetch conversations in case a new one was created
    refetchDmConversations();
  }

  return (
    <div className="sidebar h-full">
      <nav
        className="custom-scrollbar flex flex-col gap-1 overflow-y-auto border-r border-gray-200 bg-gray-50 px-2 dark:border-gray-700 dark:bg-gray-900"
        aria-label="Chat channels"
      >
        <h1 className="sr-only">Community Chat</h1>
        <span className="mt-2 flex px-2 py-2 text-lg font-bold text-gray-900 md:text-xl dark:text-white">
          Channels
        </span>
        <div className="flex flex-col gap-2">
          <ul className="flex flex-1 flex-col gap-y-1 pt-4">
            {channels.map((channel) => (
              <li key={channel}>
                <Link
                  className="flex h-8 w-full items-center rounded-md px-2 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                  activeProps={{
                    className: "bg-gray-200 dark:bg-gray-800",
                  }}
                  activeOptions={{ exact: true }}
                  to="/chat/$channelId"
                  params={{ channelId: channel }}
                >
                  <span># {channel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Direct Messages Section */}
        <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Direct Messages
            </span>
            <button
              className="cursor-pointer rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setIsUserSearchOpen(true)}
              aria-label="New direct message"
              type="button"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          {dmConversations && dmConversations.length > 0 ? (
            <ul className="flex flex-col gap-y-1">
              {dmConversations.map((conversation) => (
                <li
                  className="group relative"
                  key={conversation.id}
                >
                  <Link
                    className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                    activeProps={{
                      className: "bg-gray-200 dark:bg-gray-800",
                    }}
                    to="/chat/dm/$conversationId"
                    params={{ conversationId: conversation.id }}
                  >
                    <MessageCircleIcon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">
                      {conversation.otherUserName}
                    </span>
                  </Link>
                  <button
                    className="absolute top-1/2 right-2 hidden -translate-y-1/2 cursor-pointer rounded p-0.5 group-hover:block hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => handleCloseDM(conversation.id)}
                    aria-label="Close conversation"
                    type="button"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 text-xs text-gray-500 dark:text-gray-400">
              No direct messages yet
            </p>
          )}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>

      <UserSearchModal
        isOpen={isUserSearchOpen}
        onClose={() => setIsUserSearchOpen(false)}
        onSelectUser={handleSelectUser}
      />

      <DMRequestModal
        isOpen={isDMRequestModalOpen}
        onClose={handleDMRequestClose}
        recipientId={selectedUserId}
        recipientName={selectedUserName}
      />
    </div>
  );
}
