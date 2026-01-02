import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ulid } from "ulid";
import * as z from "zod";
import BlockerComponent from "~/components/blocker";
import { GitHubMessageEditor } from "~/components/markdown-editor";
import { queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  comment: z.string().min(2),
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
        const id = `suptickcom:${ulid()}`;
        const newSupportTicketCommentWithId = { id, comment, ticketId };

        await createSupportTicketCommentMutation.mutateAsync(
          newSupportTicketCommentWithId,
        );

        queryClient.invalidateQueries({
          queryKey: trpc.supportTickets.getSupportTicketById.queryKey({
            ticketId: ticketId,
          }),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.supportTickets.getAll.queryKey(),
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
        <form.Subscribe
          selector={(state) => [state.isDirty, state.isSubmitting]}
          children={([isDirty, isSubmitting]) => (
            <div className="flex gap-2">
              <button
                className={cn(
                  "h-10 cursor-pointer rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
                  isDirty
                    ? "hover:bg-green-700 active:bg-green-800"
                    : "cursor-not-allowed opacity-50",
                )}
                type="submit"
                disabled={!isDirty}
              >
                {isSubmitting ? "Adding comment..." : "Add comment"}
              </button>
              <button
                className={cn(
                  "h-10 cursor-pointer rounded-md px-3 py-2 text-sm/6 font-semibold text-gray-900 dark:text-white",
                  isDirty
                    ? "hover:bg-gray-200 dark:hover:bg-gray-700"
                    : "cursor-not-allowed opacity-50",
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
          )}
        />
      </div>
    </form>
  );
}
