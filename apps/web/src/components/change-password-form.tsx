import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import * as z from "zod";
import BlockerComponent from "~/components/blocker.tsx";
import { authClient } from "~/lib/auth.client.ts";
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

const changePasswordFormSchema = z.object({
  currentPassword: z
    .string()
    .min(5, "Password must be at least 5 characters")
    .max(80, "Password must be at most 80 characters")
    .trim(),
  newPassword: z
    .string()
    .min(5, "Password must be at least 5 characters")
    .max(80, "Password must be at most 80 characters")
    .trim(),
});

export default function ChangePasswordForm() {
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    } as z.infer<typeof changePasswordFormSchema>,
    validators: {
      onBlur: changePasswordFormSchema,
    },
    onSubmit: async ({ value: { currentPassword, newPassword } }) => {
      await authClient.changePassword({ currentPassword, newPassword });

      form.reset({ currentPassword: "", newPassword: "" });
    },
  });

  return (
    <form
      className="mt-10 flex w-full flex-col md:mt-20"
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
              <div className="mb-4 flex flex-col">
                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                  Change your password
                </h2>
                <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                  Make sure to use a strong password that you don't use
                  elsewhere.
                </p>
              </div>

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
            {/* Current Password Field */}
            <form.Field
              name="currentPassword"
              children={(field) => {
                return (
                  <div className="col-span-3">
                    <label
                      className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Current Password
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                        id={field.name}
                        required
                        name={field.name}
                        type="password"
                        autoComplete="current-password"
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

            {/* New Password Field */}
            <form.Field
              name="newPassword"
              children={(field) => {
                return (
                  <div className="col-span-3">
                    <label
                      className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      New Password
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                        id={field.name}
                        required
                        name={field.name}
                        type="password"
                        autoComplete="new-password"
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
          </div>
        </div>
      </div>
    </form>
  );
}
