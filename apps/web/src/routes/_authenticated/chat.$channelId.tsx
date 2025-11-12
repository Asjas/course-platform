import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useSubscription } from "@trpc/tanstack-react-query";
import { formatDate } from "date-fns";
import { useEffect, useRef } from "react";
import ChatMessageForm from "~/components/forms/chat-message-form";
import { renderMarkdown } from "~/lib/markdown.ts";
import { getChannelCacheKey, queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/chat/$channelId")({
  loader: async ({ context, params }) => {
    const { queryClient } = context;
    const { channelId } = params;

    const history = await trpcClient.chat.getChannelHistory.query({
      channelId,
    });

    queryClient.setQueryData<ChatMessage[]>(
      getChannelCacheKey(channelId),
      (prev = []) => {
        const map = new Map(prev.map((message) => [message.id, message]));
        history.forEach((message) => map.set(message.id, message));

        return Array.from(map.values());
      },
    );
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

  const { status } = useSubscription(
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

  useEffect(() => {
    if (isNearBottom()) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cachedMessages]);

  console.log("status", status);

  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto]">
      <header className="bg-gray-900/85 px-2 py-1">
        <h1 className="text-xl font-bold"># {channelId}</h1>
      </header>

      <section
        className="flex flex-col justify-end space-y-2 overflow-y-auto"
        ref={scrollRef}
      >
        {cachedMessages ? (
          cachedMessages.map(async (msg) => {
            const html = await renderMarkdown(msg.message);

            return (
              <div
                className="custom-scrollbar w-full overflow-y-auto"
                key={msg.id}
              >
                <div className="p-4 wrap-break-word">
                  <div className="flex">
                    <div className="flex w-14 justify-end">
                      <p
                        className="text-[14px] text-gray-300/75"
                        title={formatDate(new Date(msg.timestamp), "PPpp")}
                      >
                        {formatDate(new Date(msg.timestamp), "HH:mm")}
                      </p>
                    </div>
                    <div className="flex flex-1">
                      <span className="text-[14px] font-medium text-green-600">
                        {msg.username || msg.name}
                      </span>
                      <div
                        className="inline text-sm text-white"
                        dangerouslySetInnerHTML={{
                          __html: html,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="p-4 text-sm">No messages in channel</p>
        )}
      </section>

      <footer>
        <ChatMessageForm />
      </footer>
    </div>
  );
}
