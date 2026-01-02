import type {
  ChatMessage,
  ReactionUpdate,
} from "@apps/server/src/routers/chat";
import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useSubscription } from "@trpc/tanstack-react-query";
import { isSameDay } from "date-fns";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChatDateDivider } from "~/components/chat-date-divider";
import ChatMessageComponent from "~/components/chat-message";
import ChatMessageForm from "~/components/forms/chat-message-form";
import { ThreadPanel } from "~/components/thread-panel";
import { createChannelMessagesCollection } from "~/lib/db.collections";
import { trpc, trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/chat/$channelId")({
  loader: async ({ params }) => {
    // Pre-load messages into tRPC cache via queryOptions
    // The collection will automatically hydrate from this cache
    // Messages include reactions from getChannelHistory
    await trpcClient.chat.getChannelHistory.query({
      channelId: params.channelId,
    });
  },
  component: AuthenticatedChatChannelPage,
});

function AuthenticatedChatChannelPage() {
  const { channelId } = useParams({ from: "/_authenticated/chat/$channelId" });

  // Use key prop pattern to reset all component state when channelId changes
  // This avoids the need for useEffect to reset state
  return (
    <ChatChannelContent
      key={channelId}
      channelId={channelId}
    />
  );
}

function ChatChannelContent({ channelId }: { channelId: string }) {
  // Create channel-specific collection
  const channelCollection = useMemo(
    () => createChannelMessagesCollection(channelId),
    [channelId],
  );

  // Get messages from collection using useLiveQuery
  const { data: messages } = useLiveQuery(channelCollection);

  // Store SSE reaction updates separately to avoid "edited" indicator when reactions change
  // Key: messageId, Value: reactions array
  // Initial reactions come from message.reactions, SSE updates override in this map
  const [reactionOverrides, setReactionOverrides] = useState<
    Map<string, ReactionUpdate["reactions"]>
  >(new Map());

  // Thread panel state - stores the parent message when a thread is open
  // State automatically resets when channelId changes due to key prop pattern on parent
  const [selectedThread, setSelectedThread] = useState<ChatMessage | null>(
    null,
  );

  // Handler to open thread panel
  const handleOpenThread = (parentMessage: ChatMessage) => {
    setSelectedThread(parentMessage);
  };

  // Handler to close thread panel
  const handleCloseThread = () => {
    setSelectedThread(null);
  };

  // Subscribe to new messages
  useSubscription(
    trpc.chat.getChannelMessages.subscriptionOptions(
      { channelId },
      {
        enabled: true,
        onData: (msg) => {
          const newMessage = msg.data;

          // Use utils.writeUpsert to insert SSE-received messages directly into the synced data store
          // This bypasses onInsert (which would try to POST to server again)
          channelCollection.utils.writeUpsert({
            ...newMessage,
            channelId,
            reactions: newMessage.reactions || [],
            // Thread metadata - new messages from subscription don't have replies yet
            replyCount: undefined,
            latestReplyAt: undefined,
            latestReplyUserIds: undefined,
          });
        },
        onError: (err) => console.error("Subscription error:", err),
      },
    ),
  );

  // Subscribe to reaction updates via SSE
  useSubscription(
    trpc.chat.subscribeToReactions.subscriptionOptions(
      { channelId },
      {
        enabled: true,
        onData: (update) => {
          const reactionUpdate = update.data;
          // Update the reactions override map with the new reactions
          setReactionOverrides((prev) => {
            const newMap = new Map(prev);
            newMap.set(reactionUpdate.messageId, reactionUpdate.reactions);
            return newMap;
          });
        },
        onError: (err) => console.error("Reaction subscription error:", err),
      },
    ),
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    const threshold = 150;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "auto", // Use "auto" for instant scroll on load
      });
    }
  };

  // Scroll to bottom on initial mount (after render)
  useLayoutEffect(() => {
    scrollToBottom();
  }, []);

  // Scroll when new messages arrive (only if already near bottom)
  useEffect(() => {
    if (messages && messages.length > 0 && isNearBottom()) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages]);

  // Handler for immediate reaction updates from the current user
  const handleReactionUpdate = useCallback((update: ReactionUpdate) => {
    setReactionOverrides((prev) => {
      const newMap = new Map(prev);
      newMap.set(update.messageId, update.reactions);
      return newMap;
    });
  }, []);

  // Handler for optimistic update when a thread reply is deleted
  // Updates the parent message's replyCount immediately in the UI
  const handleThreadReplyDeleted = useCallback(
    (parentMessageId: string) => {
      channelCollection.update(parentMessageId, (draft) => {
        if (draft.replyCount && draft.replyCount > 0) {
          draft.replyCount -= 1;
        }
      });
      // Also update selectedThread if it's the parent being updated
      setSelectedThread((prev) => {
        if (prev && prev.id === parentMessageId && prev.replyCount) {
          return { ...prev, replyCount: Math.max(0, prev.replyCount - 1) };
        }
        return prev;
      });
    },
    [channelCollection],
  );

  // Memoize messages with date dividers to avoid recreation on every render
  const messagesWithDividers = useMemo(() => {
    if (!messages || messages.length === 0) {
      return null;
    }

    const elements: React.ReactNode[] = [];
    let lastDate: Date | null = null;

    for (const msg of messages) {
      const msgDate = new Date(msg.timestamp);

      // Check if we need a date divider
      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        elements.push(
          <ChatDateDivider
            key={`divider-${msgDate.toDateString()}`}
            date={msgDate}
          />,
        );
        lastDate = msgDate;
      }

      // Get reactions from SSE overrides, falling back to message reactions
      const reactions = reactionOverrides.get(msg.id) ?? msg.reactions ?? [];

      elements.push(
        <ChatMessageComponent
          key={msg.id}
          channelId={channelId}
          msg={msg}
          collection={channelCollection}
          reactions={reactions}
          onOpenThread={handleOpenThread}
          onReactionUpdate={handleReactionUpdate}
        />,
      );
    }

    return elements;
  }, [
    messages,
    channelId,
    channelCollection,
    reactionOverrides,
    handleReactionUpdate,
  ]);

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="grid-container flex-1">
        <div className="border-b border-gray-300 bg-gray-800 px-4 py-3 dark:border-gray-700">
          <h1 className="text-lg font-bold text-white">{`# ${channelId}`}</h1>
        </div>

        <section
          className="scrollable-section custom-scrollbar bg-gray-800"
          ref={scrollRef}
          role="log"
          aria-label={`${channelId} channel messages`}
        >
          {!messages || messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="flex flex-col">{messagesWithDividers}</div>
          )}
        </section>

        <section className="bg-gray-800">
          <ChatMessageForm mentionContext={{ type: "channel", channelId }} />
        </section>
      </div>

      {/* Thread panel - slides in from right when a thread is selected */}
      {selectedThread ? (
        <ThreadPanel
          parentMessage={selectedThread}
          channelId={channelId}
          onClose={handleCloseThread}
          onThreadReplyDeleted={handleThreadReplyDeleted}
        />
      ) : null}
    </div>
  );
}
