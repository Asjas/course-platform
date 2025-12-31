import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { CircleArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import BlockerComponent from "~/components/blocker";
import ChatMessageEditor from "~/components/chat-message-editor";
import { useAppForm } from "~/lib/form.context";
import { getChannelCacheKey, queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

interface ChatMessageFormProps {
  onMessageSent?: () => void;
  channelId?: string;
  conversationId?: string;
  isDM?: boolean;
}

export default function ChatMessageForm({
  onMessageSent,
  channelId: propChannelId,
  conversationId: propConversationId,
  isDM = false,
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

  const createChannelMessageMutation = useMutation(
    trpc.chat.postMessage.mutationOptions({
      keyPrefix: undefined,
    }),
  );

  const createDMMessageMutation = useMutation(
    trpc.chat.postDMMessage.mutationOptions({
      keyPrefix: undefined,
    }),
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
        if (isDM && conversationId) {
          await createDMMessageMutation.mutateAsync({
            conversationId,
            message,
          });

          queryClient.invalidateQueries({
            queryKey: ["dm", conversationId],
          });
        } else if (channelId) {
          await createChannelMessageMutation.mutateAsync({
            channelId,
            message,
          });

          queryClient.invalidateQueries({
            queryKey: getChannelCacheKey(channelId),
          });
        }

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
