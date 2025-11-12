import { useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { CircleArrowRightIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import BlockerComponent from "~/components/blocker";
import ChatMessageEditor from "~/components/chat-message-editor";
import { useAppForm } from "~/lib/form.context";
import { getChannelCacheKey, queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  message: z.string(),
});

export default function ChatMessageForm() {
  const { channelId } = useParams({ from: "/_authenticated/chat/$channelId" });
  const createChatMessageMutation = useMutation(
    trpc.chat.postMessage.mutationOptions({
      keyPrefix: undefined,
    }),
  );

  const form = useAppForm({
    defaultValues: {
      message: "",
    } as z.infer<typeof formSchema>,
    validators: {
      onBlur: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value: { message } }) => {
      try {
        await createChatMessageMutation.mutateAsync({
          channelId,
          message,
        });

        console.log(
          "getChannelCacheKey(channelId)",
          getChannelCacheKey(channelId),
        );

        queryClient.invalidateQueries({
          queryKey: getChannelCacheKey(channelId),
        });

        form.reset();
        toast.success("Message sent successfully!");
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error(
          "An error occurred while sending the message. Please try again.",
        );
      }
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <form
      onSubmit={(event) => {
        console.log("Submitting chat message form");
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      <BlockerComponent formIsDirty={isDirty} />

      {/* message */}
      <div className="flex flex-col gap-1">
        {/* TODO: typing indicator */}
        {/* <p className="ml-4 text-sm text-white">
          codewizard is currently typing...
        </p> */}
        <form.Field
          name="message"
          children={(field) => (
            <ChatMessageEditor
              id={field.name}
              onChange={field.handleChange}
              value={field.state.value}
            >
              <button
                className={cn(
                  "cursor-pointer font-semibold text-white shadow-xs hover:text-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
                  isSubmitting ? "cursor-not-allowed opacity-50" : "",
                )}
                aria-label="Send message"
                title="Send message"
                type="submit"
                disabled={isSubmitting}
              >
                <CircleArrowRightIcon
                  size={24}
                  color="currentColor"
                />
              </button>
            </ChatMessageEditor>
          )}
        />
      </div>
    </form>
  );
}
