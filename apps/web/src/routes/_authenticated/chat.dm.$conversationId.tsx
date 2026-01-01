import type { ChatMessage } from "@apps/server/src/routers/chat";
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
  ChatMessagesCollection,
  MessageReactionsCollection,
  useDMMessages,
} from "~/lib/db.collections";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/chat/dm/$conversationId")(
  {
    loader: async ({ context, params }) => {
      const { queryClient } = context;
      const { conversationId } = params;

      // Fetch conversation details
      const conversation =
        await trpcClient.directMessages.getConversation.query({
          conversationId,
        });

      // Fetch DM history and populate both cache and collection
      const messages = await trpcClient.chat.getDMHistory.query({
        conversationId,
        limit: 50,
      });

      // Populate TanStack Query cache
      await queryClient.setQueryData(
        trpc.chat.getDMHistory.queryKey({ conversationId, limit: 50 }),
        messages,
      );

      // Populate collection
      for (const message of messages) {
        try {
          ChatMessagesCollection.insert(message);

          // Also populate reactions from the message
          if (message.reactions && message.reactions.length > 0) {
            for (const reactionGroup of message.reactions) {
              for (const user of reactionGroup.users) {
                const reactionId = `${message.id}:${reactionGroup.emoji}:${user.userId}`;
                try {
                  MessageReactionsCollection.insert({
                    id: reactionId,
                    messageId: message.id,
                    emoji: reactionGroup.emoji,
                    userId: user.userId,
                    userName: user.userName,
                  });
                } catch (error) {
                  console.error(
                    "Failed to insert reaction into collection",
                    {
                      reactionId,
                      messageId: message.id,
                      error,
                    },
                  );
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to insert message into collection", {
            messageId: message.id,
            error,
          });
        }
      }

      return { conversation };
    },
    component: DMChatPage,
  },
);

function DMChatPage() {
  const auth = useAuth();
  const { conversationId } = useParams({
    from: "/_authenticated/chat/dm/$conversationId",
  });
  const cacheKey = ["dm", conversationId] as const;

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

          // Update TanStack Query cache
          queryClient.setQueryData<ChatMessage[]>(cacheKey, (prev = []) => {
            const map = new Map(prev.map((message) => [message.id, message]));
            map.set(newMessage.id, newMessage);
            return Array.from(map.values());
          });

          // Update collection
          try {
            ChatMessagesCollection.insert({
              ...newMessage,
              conversationId,
              reactions: newMessage.reactions || [],
            });
          } catch {
            // If already exists, skip - the subscription already has the latest
            console.debug("Could not insert message into collection");
          }

          // Update reactions collection if message has reactions
          if (newMessage.reactions && newMessage.reactions.length > 0) {
            for (const reactionGroup of newMessage.reactions) {
              for (const user of reactionGroup.users) {
                const reactionId = `${newMessage.id}:${reactionGroup.emoji}:${user.userId}`;
                try {
                  MessageReactionsCollection.insert({
                    id: reactionId,
                    messageId: newMessage.id,
                    emoji: reactionGroup.emoji,
                    userId: user.userId,
                    userName: user.userName,
                  });
                } catch {
                  // Already exists, that's okay
                  console.debug("Reaction already exists");
                }
              }
            }
          }
        },
        onError: (err) => console.error("DM subscription error:", err),
      },
    ),
  );

  // Use collection data instead of direct cache query
  const { data: collectionMessages } = useDMMessages({ conversationId });

  // Fallback to cache if collection is empty
  const { data: cachedMessages } = useQuery<ChatMessage[]>({
    queryKey: cacheKey,
    queryFn: () =>
      trpcClient.chat.getDMHistory.query({ conversationId, limit: 50 }),
  });

  // Use collection data if available, otherwise fallback to cache
  const messages =
    collectionMessages && collectionMessages.length > 0
      ? collectionMessages
      : cachedMessages;

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
        />,
      );
    }

    return elements;
  }, [messages, conversationId]);

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
        />
      </div>
    </div>
  );
}
