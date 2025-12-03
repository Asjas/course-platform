import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import BlockerComponent from "~/components/blocker";
import FieldInfo from "~/components/field-info";
import { authClient } from "~/lib/auth.client";
import { useAuth } from "~/lib/auth.context";
import { cn } from "~/lib/utils";
import { changeEmailFormSchema } from "~/schema/change-email";

export default function ChangeEmailForm() {
  const form = useForm({
    defaultValues: {
      newEmail: "",
    },
    validators: {
      onBlur: changeEmailFormSchema,
      onSubmit: changeEmailFormSchema,
    },
    onSubmit: async ({ value: { newEmail } }) => {
      const { error } = await authClient.changeEmail({ newEmail });

      if (error) {
        form.setFieldMeta("newEmail", (oldMeta) => ({
          ...oldMeta,
          isTouched: true,
          errorMap: { onSubmit: error },
        }));

        toast.error(error.message || "Failed to change email");
        return;
      }

      form.reset();
      toast.success("Email change requested! Please check your inbox.");
    },
  });

  const auth = useAuth();
  const user = auth.session?.user;

  return (
    <form
      className="mt-10 mb-20 flex w-full flex-col md:mt-20"
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

      <div className="flex">
        <div className="flex w-full flex-col justify-between">
          <div className="mb-4 flex flex-col">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Change your email
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
              Your current email is <strong>{user?.email}</strong>.
            </p>
          </div>

          <form.Subscribe
            selector={(state) => [state.isDirty, state.isSubmitting]}
            children={([isDirty, isSubmitting]) => (
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
            )}
          />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-6">
        <div className="w-full lg:pb-12">
          <div className="mt-10 flex flex-col gap-x-6 gap-y-8">
            {/* Name Field */}
            <form.Field
              name="newEmail"
              children={(field) => {
                return (
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <label
                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                        htmlFor={field.name}
                      >
                        New Email
                      </label>
                      <FieldInfo field={field} />
                    </div>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                        id={field.name}
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                      <p className="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">
                        You'll need to click a confirmation link sent to your
                        new email address to complete the change.
                      </p>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
