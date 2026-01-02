/**
 * Thread Panel Component
 *
 * A slide-over panel that displays a message thread with replies.
 * Similar to Slack's thread panel design.
 */
import type {
  ChatMessage as ChatMessageType,
  ReactionUpdate,
} from "@apps/server/src/routers/chat";
import { useLiveQuery } from "@tanstack/react-db";
import { useMutation } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import { format, isSameDay } from "date-fns";
import { CircleArrowRightIcon, XIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import BlockerComponent from "~/components/blocker";
import { ChatDateDivider } from "~/components/chat-date-divider";
import ChatMessageComponent from "~/components/chat-message";
import ChatMessageEditor from "~/components/chat-message-editor";
import { MarkdownContent } from "~/components/markdown-content";
import { createThreadMessagesCollection } from "~/lib/collections/chat-messages";
import { useAppForm } from "~/lib/form.context";
import { renderMarkdown } from "~/lib/markdown";
import { queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

// Default color for users without a precomputed color
const DEFAULT_USERNAME_COLOR = "rgb(41, 128, 185)"; // Blue

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

interface ThreadPanelProps {
  /** The parent message that started the thread */
  parentMessage: ChatMessageType;
  /** The channel ID the thread belongs to */
  channelId: string;
  /** Callback when the panel should be closed */
  onClose: () => void;
}

export function ThreadPanel({
  parentMessage,
  channelId,
  onClose,
}: ThreadPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [parentHtml, setParentHtml] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Render parent message markdown
  useEffect(() => {
    renderMarkdown(parentMessage.message)
      .then(setParentHtml)
      .catch((e) => {
        console.error(e);
        setParentHtml("<p>Error rendering message</p>");
      });
  }, [parentMessage.message]);

  // Create thread-specific collection
  const threadCollection = useMemo(
    () => createThreadMessagesCollection(channelId, parentMessage.id),
    [channelId, parentMessage.id],
  );

  // Get thread messages from collection
  const { data: threadMessages } = useLiveQuery(threadCollection);

  // Store SSE reaction updates
  const [reactionOverrides, setReactionOverrides] = useState<
    Map<string, ReactionUpdate["reactions"]>
  >(new Map());

  // Subscribe to new thread messages
  useSubscription(
    trpc.chat.subscribeToThread.subscriptionOptions(
      { channelId, parentMessageId: parentMessage.id },
      {
        enabled: true,
        onData: (msg) => {
          const newMessage = msg.data;

          try {
            threadCollection.insert({
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
                "Thread message already in collection (expected):",
                newMessage.id,
              );
            } else {
              console.error(
                "Unexpected error inserting thread message into collection:",
                { messageId: newMessage.id, channelId, error },
              );
            }
          }
        },
        onError: (err) => console.error("Thread subscription error:", err),
      },
    ),
  );

  // Subscribe to reaction updates
  useSubscription(
    trpc.chat.subscribeToReactions.subscriptionOptions(
      { channelId },
      {
        enabled: true,
        onData: (update) => {
          const reactionUpdate = update.data;
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

  // Mutation for posting thread replies
  const postReplyMutation = useMutation(
    trpc.chat.postMessage.mutationOptions({ keyPrefix: undefined }),
  );

  const form = useAppForm({
    defaultValues: {
      message: "",
    } as z.infer<typeof formSchema>,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value: { message } }) => {
      try {
        await postReplyMutation.mutateAsync({
          channelId,
          message,
          parentMessageId: parentMessage.id,
        });

        // Invalidate thread replies cache
        queryClient.invalidateQueries({
          queryKey: trpc.chat.getThreadReplies.queryKey({
            channelId,
            parentMessageId: parentMessage.id,
            limit: 50,
          }),
        });

        // Also invalidate channel history to update the reply count
        queryClient.invalidateQueries({
          queryKey: trpc.chat.getChannelHistory.queryKey({
            channelId,
            limit: 50,
          }),
        });

        form.reset();
        setSubmitAttempted(false);
        toast.success("Reply sent!");
      } catch (error) {
        console.error("Error sending reply:", error);
        toast.error("Failed to send reply. Please try again.");
      }
    },
  });

  const handleSubmit = () => {
    const message = form.getFieldValue("message");
    if (message.trim() === "") {
      setSubmitAttempted(true);
      toast.error("You can't send an empty reply");
      return;
    }
    form.handleSubmit();
  };

  // Scroll handling
  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    const threshold = 150;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    if (threadMessages && threadMessages.length > 0 && isNearBottom()) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [threadMessages]);

  // Memoize thread messages with date dividers
  const messagesWithDividers = useMemo(() => {
    if (!threadMessages || threadMessages.length === 0) {
      return null;
    }

    const elements: React.ReactNode[] = [];
    let lastDate: Date | null = null;

    for (const msg of threadMessages) {
      const msgDate = new Date(msg.timestamp);

      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        elements.push(
          <ChatDateDivider
            key={`divider-${msgDate.toDateString()}`}
            date={msgDate}
          />,
        );
        lastDate = msgDate;
      }

      const reactions = reactionOverrides.get(msg.id) ?? msg.reactions ?? [];

      elements.push(
        <ChatMessageComponent
          key={msg.id}
          channelId={channelId}
          msg={msg as ChatMessageType}
          collection={threadCollection}
          reactions={reactions}
        />,
      );
    }

    return elements;
  }, [threadMessages, channelId, threadCollection, reactionOverrides]);

  const usernameColor = parentMessage.color || DEFAULT_USERNAME_COLOR;
  const replyCount = threadMessages?.length ?? 0;

  return (
    <div className="flex h-full w-96 flex-col border-l border-gray-700 bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <div>
          <h2 className="text-lg font-bold text-white">Thread</h2>
          <p className="text-sm text-gray-400">
            {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </p>
        </div>
        <button
          className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
          type="button"
          onClick={onClose}
          aria-label="Close thread"
        >
          <XIcon size={20} />
        </button>
      </div>

      {/* Parent message */}
      <div className="bg-gray-750 border-b border-gray-700 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span
            className="text-sm font-bold"
            style={{ color: usernameColor }}
          >
            {parentMessage.username || parentMessage.name}
          </span>
          <span className="text-xs text-gray-500">
            {format(parentMessage.timestamp, "MMM d 'at' HH:mm")}
          </span>
        </div>
        <MarkdownContent
          className="mt-1 text-sm text-gray-100 [&_p]:my-0"
          html={parentHtml}
        />
      </div>

      {/* Thread replies */}
      <div
        className="custom-scrollbar flex-1 overflow-y-auto"
        ref={scrollRef}
        role="log"
        aria-label="Thread replies"
      >
        {!threadMessages || threadMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">
              No replies yet. Start the thread!
            </p>
          </div>
        ) : (
          <div className="flex flex-col py-2">{messagesWithDividers}</div>
        )}
      </div>

      {/* Reply form */}
      <div className="border-t border-gray-700 p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleSubmit();
          }}
          noValidate
        >
          <form.Subscribe
            selector={(state) => [state.isDirty]}
            children={([isDirty]) => <BlockerComponent formIsDirty={isDirty} />}
          />

          <form.Field
            name="message"
            children={(field) => (
              <ChatMessageEditor
                id={field.name}
                onChange={field.handleChange}
                value={field.state.value}
                onSubmit={handleSubmit}
                hasError={submitAttempted && field.state.value.trim() === ""}
                mentionContext={{ type: "channel", channelId }}
              >
                <form.Subscribe
                  selector={(state) => [state.isDirty, state.isSubmitting]}
                  children={([isDirty, isSubmitting]) => (
                    <button
                      className={cn(
                        "cursor-pointer font-semibold text-gray-600 hover:text-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:text-white dark:hover:text-green-400",
                        isSubmitting || !isDirty
                          ? "cursor-not-allowed opacity-50"
                          : "",
                      )}
                      aria-label="Send reply"
                      title="Send reply"
                      type="submit"
                      disabled={isSubmitting || !isDirty}
                    >
                      <CircleArrowRightIcon
                        size={24}
                        color="currentColor"
                      />
                    </button>
                  )}
                />
              </ChatMessageEditor>
            )}
          />
        </form>
      </div>
    </div>
  );
}
