import { useForm, useStore } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ulid } from "ulid";
import * as z from "zod";
import BlockerComponent from "~/components/blocker";
import FieldInfo from "~/components/field-info";
import GitHubMessageEditor from "~/components/github-message-editor";
import { SupportTicketsCollection } from "~/lib/db.collections";
import { cn } from "~/lib/utils";
import { supportTicketFormSchema } from "~/schema/support-ticket";

export default function NewSupportTicketForm() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      repo: "",
      priority: "medium",
      status: "open",
      moduleId: undefined,
      lessonId: undefined,
    } as z.infer<typeof supportTicketFormSchema>,
    validators: {
      onBlur: supportTicketFormSchema,
      onSubmit: supportTicketFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const id = `suptick:${ulid()}`;
        const newSupportTicketWithId = { id, ...value };
        // @ts-expect-error must use any to satisfy the type system
        const tx = SupportTicketsCollection.insert(newSupportTicketWithId);

        await tx.isPersisted.promise;
        form.reset();
        toast.success("Support ticket created successfully!");
        await new Promise((resolve) => setTimeout(resolve, 300));

        navigate({
          to: "/support/$supportTicket",
          params: { supportTicket: id },
        });
      } catch (error) {
        console.error("Error creating support ticket:", error);
        toast.error(
          "An error occurred while creating the support ticket. Please try again.",
        );
      }
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <form
      className="mt-10 flex flex-col"
      onSubmit={(event) => {
        console.log("form submit event:", event);
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      <BlockerComponent formIsDirty={isDirty} />

      <div className="flex">
        <div className="flex w-full flex-col justify-between">
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
      </div>

      <div className="flex flex-col justify-between gap-6">
        <div className="w-full lg:pb-12">
          <div className="mt-10 flex flex-col gap-x-6 gap-y-8">
            {/* Title Field */}
            <form.Field
              name="title"
              children={(field) => {
                return (
                  <div className="col-span-3">
                    <label
                      className="block text-sm/6 font-medium text-white"
                      htmlFor={field.name}
                    >
                      Title (Required)
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-green-500 sm:text-sm/6"
                        id={field.name}
                        name={field.name}
                        type="text"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                );
              }}
            />

            {/* Repo Field */}
            <form.Field
              name="repo"
              children={(field) => {
                return (
                  <div className="col-span-3">
                    <label
                      className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Repostitory URL (Required)
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-green-500 sm:text-sm/6"
                        id={field.name}
                        name={field.name}
                        type="text"
                        value={field.state.value as string}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                );
              }}
            />

            {/* Description Field */}
            <form.Field
              name="description"
              children={(field) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-white"
                    htmlFor={field.name}
                  >
                    Description (Required)
                  </label>
                  <div className="mt-2">
                    <GitHubMessageEditor
                      id={field.name}
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder="Describe the issue..."
                    />
                    <FieldInfo field={field} />
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
