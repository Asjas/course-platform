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

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
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
              onSubmit={() => form.handleSubmit()}
            >
              <form.Subscribe
                selector={(state) => [state.isDirty, state.isSubmitting]}
                children={([isDirty, isSubmitting]) => (
                  <button
                    className={cn(
                      "cursor-pointer font-semibold text-gray-600 shadow-xs hover:text-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:text-white dark:hover:text-green-400",
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
