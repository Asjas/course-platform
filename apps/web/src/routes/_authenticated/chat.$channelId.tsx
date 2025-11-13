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
    const history = await trpcClient.chat.getChannelHistory.query({
      channelId,
    });

    queryClient.setQueryData<ChatMessage[]>(cacheKey, () => {
      const map = new Map<string, ChatMessage>();
      history.forEach((msg) => map.set(msg.id, msg));
      return Array.from(map.values());
    });
  },
  component: RouteComponent,
});

interface ChatMessage {
  id: string;
  message: string;
  name: string;
  username: string | undefined;
  timestamp: number;
}

function RouteComponent() {
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
      <header className="bg-gray-900/75 px-4 py-1">
        <h1 className="text-xl font-bold"># {channelId}</h1>
      </header>

      <section
        className="scrollable-section custom-scrollbar bg-gray-800"
        ref={scrollRef}
      >
        {!cachedMessages || cachedMessages.length === 0 ? (
          <p className="text-sm text-gray-400">No messages yet.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {cachedMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                msg={msg}
              />
            ))}
          </div>
        )}
      </section>
      <footer>
        <ChatMessageForm />
      </footer>
    </div>
  );
}
