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

      // Fetch DM history using tRPC query options pattern
      await queryClient.fetchQuery(
        trpc.chat.getDMHistory.queryOptions({ conversationId, limit: 50 }),
      );

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

          queryClient.setQueryData<ChatMessage[]>(cacheKey, (prev = []) => {
            const map = new Map(prev.map((message) => [message.id, message]));
            map.set(newMessage.id, newMessage);

            return Array.from(map.values());
          });
        },
        onError: (err) => console.error("DM subscription error:", err),
      },
    ),
  );

  const { data: cachedMessages } = useQuery<ChatMessage[]>({
    queryKey: cacheKey,
    queryFn: () =>
      trpcClient.chat.getDMHistory.query({ conversationId, limit: 50 }),
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
        behavior: "auto",
      });
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    if (cachedMessages && cachedMessages.length > 0 && isNearBottom()) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [cachedMessages]);

  const messagesWithDividers = useMemo(() => {
    if (!cachedMessages || cachedMessages.length === 0) {
      return null;
    }

    const elements: React.ReactNode[] = [];
    let lastDate: Date | null = null;

    for (const msg of cachedMessages) {
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
  }, [cachedMessages, conversationId]);

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
