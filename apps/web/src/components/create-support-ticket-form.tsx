import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as z from "zod";
import BlockerComponent from "~/components/blocker.tsx";
import GitHubMessageEditor from "~/components/editor";
import { trpc } from "~/lib/trpc.client.ts";
import { cn } from "~/lib/utils.ts";

function FieldInfo({ field }: { field: AnyFieldApi }) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const meta = field.state.meta;

  return (
    <>
      {isInvalid ? (
        <em className="text-sm text-red-600">
          {meta.errors.map((error) => error.message).join(", ")}
        </em>
      ) : null}
      {meta.isValidating ? "Validating..." : null}
    </>
  );
}

const supportTicketSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().max(1000),
  repo: z.url(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
});

export default function NewSupportTicketForm() {
  const navigate = useNavigate();
  const createSupportTicketMutation = useMutation(
    trpc.supportTickets.createSupportTicket.mutationOptions({
      keyPrefix: undefined,
    }),
  );

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      repo: "",
      priority: "medium",
      status: "open",
      moduleId: undefined,
      lessonId: undefined,
    } as z.infer<typeof supportTicketSchema>,
    validators: {
      onBlur: supportTicketSchema,
    },
    onSubmit: async ({ value }) => {
      const newSupportTicket =
        await createSupportTicketMutation.mutateAsync(value);

      form.reset();

      // 2. Wait 300ms before navigating
      await new Promise((resolve) => setTimeout(resolve, 300));

      navigate({
        to: "/support/$supportTicket",
        params: { supportTicket: newSupportTicket.id },
      });
    },
  });

  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      <form.Subscribe
        selector={(state) => [state.isDirty, state.isSubmitting]}
        children={([isDirty, isSubmitting]) => (
          <div className="flex">
            <div className="flex w-full flex-col justify-between">
              <div className="flex gap-2">
                <button
                  className={cn(
                    "h-10 cursor-pointer rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
                    isDirty
                      ? "hover:bg-gray-600"
                      : "cursor-not-allowed opacity-50",
                  )}
                  type="submit"
                  disabled={!isDirty}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  className={cn(
                    "h-10 cursor-pointer rounded-md px-3 py-2 text-sm/6 font-semibold text-gray-900 dark:text-white",
                    isDirty
                      ? "hover:bg-gray-600"
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
            </div>
            <BlockerComponent formIsDirty={isDirty} />
          </div>
        )}
      />

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
                      className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Title (Required)
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                        id={field.name}
                        required
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                        id={field.name}
                        required
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

            {/* Description Field */}
            <form.Field
              name="description"
              children={(field) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
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

            {/* Additional fields can be added here following the same pattern */}
          </div>
        </div>
      </div>
    </form>
  );
}
