import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useEffect, useLayoutEffect, useRef } from "react";
import ChatMessage from "~/components/chat-message";
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

interface ChatMessage {
  id: string;
  message: string;
  name: string;
  username: string | null;
  timestamp: number;
  createdAt: number;
  editedAt?: number;
}

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

  return (
    <div className="grid-container">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-1 dark:border-gray-700 dark:bg-gray-900/75">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{`# ${channelId}`}</h1>
      </div>

      <section
        className="scrollable-section custom-scrollbar bg-white dark:bg-gray-800"
        ref={scrollRef}
      >
        {!cachedMessages || cachedMessages.length === 0 ? (
          <div className="flex h-full items-end">
            <p className="text-sm text-gray-400">No messages yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {cachedMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                channelId={channelId}
                msg={msg}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <ChatMessageForm />
      </section>
    </div>
  );
}
