import type { ChatMessage } from "@apps/server/src/routers/chat";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useSubscription } from "@trpc/tanstack-react-query";
import { isSameDay } from "date-fns";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ChatDateDivider } from "~/components/chat-date-divider";
import ChatMessageComponent from "~/components/chat-message";
import ChatMessageForm from "~/components/forms/chat-message-form";
import { getChannelCacheKey, queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/chat/$channelId")({
  loader: async ({ context, params }) => {
    const { queryClient } = context;
    const { channelId } = params;
    const cacheKey = getChannelCacheKey(channelId);

    await queryClient.fetchQuery({
      queryKey: cacheKey,
      queryFn: () => trpcClient.chat.getChannelHistory.query({ channelId }),
    });
  },
  component: AuthenticatedChatChannelPage,
});

function AuthenticatedChatChannelPage() {
  const { channelId } = useParams({ from: "/_authenticated/chat/$channelId" });
  const cacheKey = getChannelCacheKey(channelId);

  useSubscription(
    trpc.chat.getChannelMessages.subscriptionOptions(
      { channelId },
      {
        enabled: true,
        onData: (msg) => {
          const newMessage = msg.data;

          queryClient.setQueryData<ChatMessage[]>(cacheKey, (prev = []) => {
            const map = new Map(prev.map((message) => [message.id, message]));
            map.set(newMessage.id, newMessage);

            return Array.from(map.values());
          });
        },
        onError: (err) => console.error("Subscription error:", err),
      },
    ),
  );

  const { data: cachedMessages } = useQuery<ChatMessage[]>({
    queryKey: cacheKey,
    queryFn: () => trpcClient.chat.getChannelHistory.query({ channelId }),
  });

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
    if (cachedMessages && cachedMessages.length > 0 && isNearBottom()) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [cachedMessages]);

  // Memoize messages with date dividers to avoid recreation on every render
  const messagesWithDividers = useMemo(() => {
    if (!cachedMessages || cachedMessages.length === 0) {
      return null;
    }

    const elements: React.ReactNode[] = [];
    let lastDate: Date | null = null;

    for (const msg of cachedMessages) {
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
  }, [cachedMessages, channelId]);

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
        {!cachedMessages || cachedMessages.length === 0 ? (
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
