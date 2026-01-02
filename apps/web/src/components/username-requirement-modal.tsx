import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import FieldInfo from "~/components/field-info";
import { authClient } from "~/lib/auth.client";
import { usernameOnlySchema } from "~/schema/profile-form";

interface UsernameRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UsernameRequirementModal({
  isOpen,
  onClose,
  onSuccess,
}: UsernameRequirementModalProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      username: "",
    },
    validators: {
      onBlur: usernameOnlySchema,
      onSubmit: usernameOnlySchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      const toastId = toast.loading("Setting username...");

      try {
        // Use Promise.race with timeout since authClient.updateUser can hang
        const updatePromise = authClient.updateUser({
          username: value.username,
        });

        const timeoutPromise = new Promise<{ error: null }>((resolve) =>
          setTimeout(() => resolve({ error: null }), 2000),
        );

        const result = await Promise.race([updatePromise, timeoutPromise]);

        if (result && "error" in result && result.error) {
          const errorMessage =
            typeof result.error === "object" && result.error !== null
              ? (result.error as { message?: string }).message ||
                "Username is already taken or invalid"
              : "Username is already taken or invalid";

          form.setFieldMeta("username", (oldMeta) => ({
            ...oldMeta,
            isTouched: true,
            errorMap: { onSubmit: errorMessage },
          }));

          toast.error(errorMessage, { id: toastId });
          setIsSubmitting(false);
          return;
        }

        toast.success("Username set successfully!", { id: toastId });
        onSuccess();
      } catch (error) {
        console.error("Failed to set username:", error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to set username. Please try again.";

        form.setFieldMeta("username", (oldMeta) => ({
          ...oldMeta,
          isTouched: true,
          errorMap: { onSubmit: errorMessage },
        }));

        toast.error(errorMessage, { id: toastId });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  function handleLeaveChat() {
    onClose();
    navigate({ to: "/dashboard" });
  }

  return (
    <Dialog
      className="relative z-50"
      open={isOpen}
      onClose={() => {
        if (!isSubmitting) {
          handleLeaveChat();
        }
      }}
    >
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/50"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="mb-4 flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <MessageCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center text-lg font-semibold text-gray-900 dark:text-white">
              Username Required for Chat
            </DialogTitle>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              To participate in the community chat, you need to set a unique
              username. This will be visible to other users in the chat.
            </p>
          </div>

          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field name="username">
              {(field) => (
                <div>
                  <label
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                    htmlFor={field.name}
                  >
                    Choose a Username
                  </label>
                  <div className="mt-2">
                    <input
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:outline-gray-600"
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="yourname123"
                      autoComplete="username"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    3-32 characters. Letters, numbers, underscores, and hyphens
                    only.
                  </p>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                className="w-full cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-100 sm:w-auto dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
                type="button"
                onClick={handleLeaveChat}
                disabled={isSubmitting}
              >
                Leave Chat
              </button>
              <button
                className="w-full cursor-pointer rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Setting..." : "Set Username & Join Chat"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
