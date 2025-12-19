import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import BlockerComponent from "~/components/blocker";
import FieldInfo from "~/components/field-info";
import { authClient } from "~/lib/auth.client";
import { cn } from "~/lib/utils";

export default function DeleteAccountForm() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value: { password } }) => {
      const { error } = await authClient.deleteUser({ password });

      if (error) {
        form.setFieldMeta("password", (oldMeta) => ({
          ...oldMeta,
          isTouched: true,
          errorMap: { onSubmit: error },
        }));

        toast.error(error.message || "Failed to delete account");
        return;
      }

      form.reset();
      toast.success("Account deleted successfully!");
      await new Promise((resolve) => setTimeout(resolve, 300));

      navigate({ to: "/", replace: true });
    },
  });

  return (
    <form
      className="mt-10 flex w-full flex-col md:mt-15"
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
            <h2 className="text-base/7 font-semibold text-red-600">
              Delete your account
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
              All your personal data will be permanently deleted. Any other data
              will be anonymized. You can refer to the{" "}
              <Link
                className="text-green-600 underline hover:no-underline"
                to="/privacy"
              >
                privacy policy
              </Link>{" "}
              for more details.
            </p>
            <p className="mt-1 text-sm/6 text-orange-600">
              User accounts can be restored from backup within 30 days by
              contacting support.
            </p>
          </div>

          <form.Subscribe
            selector={(state) => [state.isDirty, state.isSubmitting]}
            children={([isDirty, isSubmitting]) => (
              <div className="flex gap-2">
                <button
                  className={cn(
                    "h-10 cursor-pointer rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
                    isDirty
                      ? "hover:bg-red-700 active:bg-red-800"
                      : "cursor-not-allowed opacity-50",
                  )}
                  type="submit"
                  disabled={!isDirty}
                >
                  {isSubmitting ? "Deleting account..." : "Delete Account"}
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
      </div>

      <div className="mb-10 flex flex-col justify-between gap-6">
        <div className="w-full pb-4 md:pb-6">
          <div className="mt-10 flex flex-col gap-x-6 gap-y-8">
            {/* Password Field */}
            <form.Field
              name="password"
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
          </div>
        </div>
      </div>
    </form>
  );
}
