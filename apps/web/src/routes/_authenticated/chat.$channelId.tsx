import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useSubscription } from "@trpc/tanstack-react-query";
import { isSameDay } from "date-fns";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChatDateDivider } from "~/components/chat-date-divider";
import ChatMessageComponent from "~/components/chat-message";
import ChatMessageForm from "~/components/forms/chat-message-form";
import {
  MessageReactionsCollection,
  createChannelMessagesCollection,
} from "~/lib/db.collections";
import { trpc, trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/chat/$channelId")({
  loader: async ({ params }) => {
    // Pre-load messages into tRPC cache via queryOptions
    // The collection will automatically hydrate from this cache
    await trpcClient.chat.getChannelHistory.query({
      channelId: params.channelId,
    });
  },
  component: AuthenticatedChatChannelPage,
});

function AuthenticatedChatChannelPage() {
  const { channelId } = useParams({ from: "/_authenticated/chat/$channelId" });

  // Create channel-specific collection
  const [channelCollection] = useState(() =>
    createChannelMessagesCollection(channelId),
  );

  // Get messages from collection using useLiveQuery
  const { data: messages } = useLiveQuery(channelCollection);

  // Subscribe to new messages
  useSubscription(
    trpc.chat.getChannelMessages.subscriptionOptions(
      { channelId },
      {
        enabled: true,
        onData: (msg) => {
          const newMessage = msg.data;

          // Update collection - this will automatically update the cache via collection's queryKey
          try {
            channelCollection.insert({
              ...newMessage,
              channelId,
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
                  channelId,
                  error,
                },
              );
            }
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
        onError: (err) => console.error("Subscription error:", err),
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

      elements.push(
        <ChatMessageComponent
          key={msg.id}
          channelId={channelId}
          msg={msg}
        />,
      );
    }

    return elements;
  }, [messages, channelId]);

  return (
    <div className="grid-container">
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
        <ChatMessageForm />
      </section>
    </div>
  );
}
