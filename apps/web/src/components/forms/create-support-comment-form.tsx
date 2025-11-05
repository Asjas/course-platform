import { useForm, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";
import BlockerComponent from "~/components/blocker";
import GitHubMessageEditor from "~/components/github-message-editor";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils.ts";

const formSchema = z.object({
  comment: z.string().min(2).max(1000),
});

export default function SupportCommentForm({ ticketId }: { ticketId: string }) {
  const createSupportTicketCommentMutation = useMutation(
    trpc.supportTickets.createSupportTicketComment.mutationOptions({
      keyPrefix: undefined,
    }),
  );

  const form = useForm({
    defaultValues: {
      comment: "",
    } as z.infer<typeof formSchema>,
    validators: {
      onBlur: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value: { comment } }) => {
      try {
        await createSupportTicketCommentMutation.mutateAsync({
          comment,
          ticketId,
        });
        form.reset();
        toast.success("Comment added successfully!");
      } catch (error) {
        console.error("Error adding comment:", error);
        toast.error(
          "An error occurred while adding the comment. Please try again.",
        );
      }
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      <BlockerComponent formIsDirty={isDirty} />

      {/* Comment */}
      <form.Field
        name="comment"
        children={(field) => (
          <div>
            <GitHubMessageEditor
              id={field.name}
              onChange={field.handleChange}
              value={field.state.value}
            />
          </div>
        )}
      />

      <div className="mt-5 flex w-full flex-col items-end">
        <div className="flex gap-2">
          <button
            className={cn(
              "h-10 cursor-pointer rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
              isDirty ? "hover:bg-gray-600" : "cursor-not-allowed opacity-50",
            )}
            type="submit"
            disabled={!isDirty}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            className={cn(
              "h-10 cursor-pointer rounded-md px-3 py-2 text-sm/6 font-semibold text-gray-900 dark:text-white",
              isDirty ? "hover:bg-gray-600" : "cursor-not-allowed opacity-50",
            )}
            type="reset"
            disabled={!isDirty}
            onClick={(event) => {
              event.preventDefault();
              form.reset();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
