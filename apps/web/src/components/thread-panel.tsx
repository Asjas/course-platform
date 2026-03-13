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
import { useSubscription } from "@trpc/tanstack-react-query";
import { format, isSameDay } from "date-fns";
import { CircleArrowRightIcon, GripVerticalIcon, XIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { ulid } from "ulid";
import * as z from "zod";
import BlockerComponent from "~/components/blocker";
import { ChatDateDivider } from "~/components/chat-date-divider";
import ChatMessageComponent from "~/components/chat-message";
import ChatMessageEditor from "~/components/chat-message-editor";
import { MarkdownContent } from "~/components/markdown-content";
import { useAuth } from "~/lib/auth.context";
import { createThreadMessagesCollection } from "~/lib/db.collections";
import { useAppForm } from "~/lib/form.context";
import { renderMarkdown } from "~/lib/markdown";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

// Default color for users without a precomputed color
const DEFAULT_USERNAME_COLOR = "rgb(41, 128, 185)"; // Blue

// Thread panel resize constraints
const MIN_WIDTH = 320;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 384;
const STORAGE_KEY = "thread-panel-width";

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
  /** Callback when a thread reply is deleted (for optimistic update of parent's replyCount) */
  onThreadReplyDeleted?: (parentMessageId: string) => void;
}

export function ThreadPanel({
  parentMessage,
  channelId,
  onClose,
  onThreadReplyDeleted,
}: ThreadPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLButtonElement>(null);
  const [parentHtml, setParentHtml] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Width state with localStorage persistence
  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_WIDTH;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
        return parsed;
      }
    }
    return DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate width from right edge of viewport
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, width.toString());
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Add cursor style to body during resize
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, width]);

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

          // Use utils.writeUpsert to insert SSE-received messages directly into the synced data store
          // This bypasses onInsert (which would try to POST to server again)
          threadCollection.utils.writeUpsert({
            ...newMessage,
            channelId,
            reactions: newMessage.reactions || [],
          });
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

  // Handle immediate reaction updates from user interactions
  const handleReactionUpdate = useCallback((update: ReactionUpdate) => {
    setReactionOverrides((prev) => {
      const newMap = new Map(prev);
      newMap.set(update.messageId, update.reactions);
      return newMap;
    });
  }, []);

  // Get current user info for optimistic message display
  const auth = useAuth();
  // Timestamp captured in handleSubmit (event handler) so it is not inside
  // the onSubmit hook argument, which would be flagged as an impure call.
  const submitTimestampRef = useRef(0);

  const form = useAppForm({
    defaultValues: {
      message: "",
    } as z.infer<typeof formSchema>,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value: { message } }) => {
      try {
        const user = auth.session?.user;
        if (!user) {
          toast.error("You must be logged in to reply.");
          return;
        }

        const now = submitTimestampRef.current;

        // Insert via collection - triggers onInsert which calls the server
        // SSE subscription will handle updates for all clients
        // Note: Only include fields that match the server's ChatMessage type
        threadCollection.insert({
          id: ulid(),
          channelId,
          message,
          parentMessageId: parentMessage.id,
          name: user.name || "Unknown",
          username: user.username || null,
          color: null,
          timestamp: now,
          createdAt: now,
          reactions: [],
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
    submitTimestampRef.current = Date.now();
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
          onReactionUpdate={handleReactionUpdate}
          onThreadReplyDeleted={onThreadReplyDeleted}
        />,
      );
    }

    return elements;
  }, [
    threadMessages,
    channelId,
    threadCollection,
    reactionOverrides,
    handleReactionUpdate,
    onThreadReplyDeleted,
  ]);

  const usernameColor = parentMessage.color || DEFAULT_USERNAME_COLOR;
  const replyCount = threadMessages?.length ?? 0;

  return (
    <div
      className="relative flex h-full flex-col border-l border-gray-700 bg-gray-800"
      style={{ width: `${width}px` }}
    >
      {/* Resize handle - uses button for proper a11y with mouse events */}
      <button
        className="absolute top-0 left-0 z-10 flex h-full w-2 cursor-col-resize items-center justify-center border-none bg-transparent p-0 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        ref={resizeRef}
        type="button"
        onMouseDown={handleMouseDown}
        aria-label={`Resize thread panel, current width ${width} pixels`}
      >
        <span className="flex h-16 w-4 items-center justify-center rounded bg-gray-600">
          <GripVerticalIcon
            className="text-gray-400"
            size={12}
          />
        </span>
      </button>

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
                iconSize={14}
                buttonPadding="p-1"
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
                        size={18}
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
