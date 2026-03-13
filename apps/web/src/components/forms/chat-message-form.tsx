import { useParams } from "@tanstack/react-router";
import { CircleArrowRightIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ulid } from "ulid";
import * as z from "zod";
import BlockerComponent from "~/components/blocker";
import ChatMessageEditor from "~/components/chat-message-editor";
import type { MentionContext } from "~/components/mention-picker";
import { useAuth } from "~/lib/auth.context";
import { useAppForm } from "~/lib/form.context";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

// Method syntax is intentional: it provides bivariance so that any
// Collection<T> subtype (e.g. Collection<ChannelMessage>) is assignable here.
interface AnyCollection {
  insert(data: object): unknown;
}

interface ChatMessageFormProps {
  onMessageSent?: () => void;
  channelId?: string;
  conversationId?: string;
  isDM?: boolean;
  mentionContext?: MentionContext;
  /** The collection to insert messages into */
  collection?: AnyCollection;
}

export default function ChatMessageForm({
  onMessageSent,
  channelId: propChannelId,
  conversationId: propConversationId,
  isDM = false,
  mentionContext,
  collection,
}: ChatMessageFormProps = {}) {
  const params = useParams({ strict: false });
  const channelId = propChannelId || params.channelId;
  const conversationId = isDM
    ? propConversationId ||
      (params as { conversationId?: string }).conversationId ||
      (propChannelId && propChannelId.startsWith("dm:")
        ? propChannelId.slice("dm:".length)
        : undefined)
    : undefined;

  const [submitAttempted, setSubmitAttempted] = useState(false);
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
          toast.error("You must be logged in to send a message.");
          return;
        }

        if (!collection) {
          toast.error("Unable to send message. Please refresh the page.");
          return;
        }

        const now = submitTimestampRef.current;

        // Insert via collection - triggers onInsert which calls the server
        // SSE subscription will handle updates for all clients
        // Note: Only include fields that match the server's ChatMessage type
        collection.insert({
          id: ulid(),
          channelId: isDM ? undefined : channelId,
          conversationId: isDM ? conversationId : undefined,
          message,
          name: user.name || "Unknown",
          username: user.username || null,
          color: null,
          timestamp: now,
          createdAt: now,
          reactions: [],
        });

        form.reset();
        setSubmitAttempted(false);
        toast.success("Message sent successfully!");
        onMessageSent?.();
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error(
          "An error occurred while sending the message. Please try again.",
        );
      }
    },
  });

  const handleSubmit = () => {
    const message = form.getFieldValue("message");
    if (message.trim() === "") {
      setSubmitAttempted(true);
      toast.error("You can't send an empty message");
      return;
    }
    submitTimestampRef.current = Date.now();
    form.handleSubmit();
  };

  return (
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

      {/* message */}
      <div className="flex flex-col gap-1">
        {/* TODO: typing indicator */}
        <form.Field
          name="message"
          children={(field) => (
            <ChatMessageEditor
              id={field.name}
              onChange={field.handleChange}
              value={field.state.value}
              onSubmit={handleSubmit}
              hasError={submitAttempted && field.state.value.trim() === ""}
              mentionContext={mentionContext}
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
                    aria-label="Send message"
                    title="Send message"
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
      </div>
    </form>
  );
}
