import { useLiveQuery } from "@tanstack/react-db";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useSubscription } from "@trpc/tanstack-react-query";
import { isSameDay } from "date-fns";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ChatDateDivider } from "~/components/chat-date-divider";
import ChatMessageComponent from "~/components/chat-message";
import ChatMessageForm from "~/components/forms/chat-message-form";
import { useAuth } from "~/lib/auth.context";
import {
  createDMMessagesCollection,
  prefetchMessageReactions,
} from "~/lib/db.collections";
import { trpc, trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/chat/dm/$conversationId")(
  {
    loader: async ({ params }) => {
      // Pre-load messages into tRPC cache via queryOptions
      // The collection will automatically hydrate from this cache
      const messages = await trpcClient.chat.getDMHistory.query({
        conversationId: params.conversationId,
        limit: 50,
      });

      // Prefetch reactions for all messages to hydrate the React Query cache
      // This prevents N+1 queries when each ChatMessage component mounts
      if (messages.length > 0) {
        await prefetchMessageReactions(messages.map((m) => m.id));
      }

      // Also fetch conversation details
      await trpcClient.directMessages.getConversation.query({
        conversationId: params.conversationId,
      });
    },
    component: AuthenticatedChatDMPage,
  },
);

function AuthenticatedChatDMPage() {
  const auth = useAuth();
  const { conversationId } = useParams({
    from: "/_authenticated/chat/dm/$conversationId",
  });

  // Create DM-specific collection - recreate when conversationId changes
  const dmCollection = useMemo(
    () => createDMMessagesCollection(conversationId),
    [conversationId],
  );

  // Get messages from collection using useLiveQuery
  const { data: messages } = useLiveQuery(dmCollection);

  // Fetch conversation details
  const { data: conversation } = useQuery({
    ...trpc.directMessages.getConversation.queryOptions({ conversationId }),
  });

  // Subscribe to new DM messages
  useSubscription(
    trpc.chat.getDMMessages.subscriptionOptions(
      { conversationId },
      {
        enabled: true,
        onData: (msg) => {
          const newMessage = msg.data;

          // Update collection - this will automatically update the cache via collection's queryKey
          try {
            dmCollection.insert({
              ...newMessage,
              conversationId,
              reactions: newMessage.reactions || [],
            });
          } catch (error) {
            if (
              error instanceof Error &&
              /already exists|duplicate/i.test(error.message)
            ) {
              console.debug(
                "Message already in collection (expected):",
                newMessage.id,
              );
            } else {
              console.error(
                "Unexpected error inserting message into collection:",
                {
                  messageId: newMessage.id,
                  conversationId,
                  error,
                },
              );
            }
          }
        },
        onError: (err) => console.error("DM subscription error:", err),
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
        behavior: "auto",
      });
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    if (messages && messages.length > 0 && isNearBottom()) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages]);

  const messagesWithDividers = useMemo(() => {
    if (!messages || messages.length === 0) {
      return null;
    }

    const elements: React.ReactNode[] = [];
    let lastDate: Date | null = null;

    for (const msg of messages) {
      const msgDate = new Date(msg.timestamp);

      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        elements.push(
          <ChatDateDivider
            key={`date-${msgDate.getTime()}`}
            date={msgDate}
          />,
        );
        lastDate = msgDate;
      }

      elements.push(
        <ChatMessageComponent
          key={msg.id}
          msg={msg}
          channelId={`dm:${conversationId}`}
          collection={dmCollection}
        />,
      );
    }

    return elements;
  }, [messages, conversationId, dmCollection]);

  // Determine the other user's name for the header
  const otherUserName = useMemo(() => {
    if (!conversation || !auth.session) return "Direct Message";

    const isUser1 = conversation.user1Id === auth.session.user.id;
    const otherUser = isUser1 ? conversation.user2 : conversation.user1;

    return otherUser.username || otherUser.name;
  }, [conversation, auth.session]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 items-center border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          # {otherUserName}
        </h2>
      </header>

      <div
        className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4"
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Direct messages"
      >
        {messagesWithDividers}
      </div>

      <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900">
        <ChatMessageForm
          onMessageSent={() => {
            requestAnimationFrame(scrollToBottom);
          }}
          channelId={`dm:${conversationId}`}
          isDM={true}
          mentionContext={{ type: "dm", conversationId }}
        />
      </div>
    </div>
  );
}
