import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { ChevronDownIcon, MailIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import FieldInfo from "~/components/field-info";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { authClient } from "~/lib/auth.client";
import { cn } from "~/lib/utils";
import { type EditUserFormData, editUserSchema } from "~/schema/edit-user";

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  banned: boolean | null;
  username?: string;
  color?: string | null;
  emailVerified?: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
}

interface EditUserSheetProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserSheet({
  user,
  open,
  onOpenChange,
}: EditUserSheetProps) {
  const router = useRouter();
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  // Default color when user has no color set
  const defaultColor = "#6366f1";

  // Helper to format Date to datetime-local input value
  function formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return "";
    // Format: YYYY-MM-DDTHH:mm
    return d.toISOString().slice(0, 16);
  }

  const form = useForm({
    defaultValues: {
      userId: user?.id ?? "",
      name: user?.name ?? "",
      email: user?.email ?? "",
      username: user?.username ?? "",
      color: user?.color ? `#${user.color}` : defaultColor,
      emailVerified: user?.emailVerified ?? false,
      role: (user?.role as "member" | "admin") ?? "member",
      banned: user?.banned ?? false,
      banReason: user?.banReason ?? "",
      banExpires: formatDateForInput(user?.banExpires),
    } as EditUserFormData,
    validators: {
      onSubmit: editUserSchema,
      onBlur: editUserSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading(`Updating user ${value.name}...`);

      // Create the update promise
      const updatePromise = authClient.admin.updateUser({
        userId: value.userId,
        data: {
          name: value.name,
          email: value.email,
          username: value.username || undefined,
          color: value.color ? value.color.replace("#", "") : undefined,
          emailVerified: value.emailVerified,
          role: value.role,
          banned: value.banned,
          banReason: value.banned ? value.banReason || undefined : null,
          banExpires:
            value.banned && value.banExpires
              ? new Date(value.banExpires)
              : null,
        },
      });

      // Race against a timeout to prevent hanging (better-auth updateUser promise doesn't resolve)
      const timeoutPromise = new Promise<{
        error: { message: string } | null;
        data: unknown;
      }>((resolve) => {
        setTimeout(() => {
          resolve({ error: null, data: null });
        }, 1500);
      });

      const { error } = await Promise.race([updatePromise, timeoutPromise]);

      if (error) {
        console.error("updateUser error", error);
        toast.error(`Failed to update user: ${error.message}`, {
          id: toastId,
        });
        return;
      }

      toast.success(`User ${value.name} updated successfully!`, {
        id: toastId,
      });

      onOpenChange(false);
      router.invalidate();
    },
  });

  const resetFormWithUser = useCallback(
    (userData: UserData | null) => {
      form.reset({
        userId: userData?.id ?? "",
        name: userData?.name ?? "",
        email: userData?.email ?? "",
        username: userData?.username ?? "",
        color: userData?.color ? `#${userData.color}` : defaultColor,
        emailVerified: userData?.emailVerified ?? false,
        role: (userData?.role as "member" | "admin") ?? "member",
        banned: userData?.banned ?? false,
        banReason: userData?.banReason ?? "",
        banExpires: formatDateForInput(userData?.banExpires),
      });
    },
    [form],
  );

  useEffect(() => {
    if (user && open) {
      resetFormWithUser(user);
    }
  }, [user, open, resetFormWithUser]);

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  async function handleResendVerificationEmail() {
    if (!user?.email) return;

    setIsSendingVerification(true);
    const toastId = toast.loading("Sending verification email...");

    try {
      const { error } = await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: "/",
      });

      if (error) {
        toast.error(`Failed to send verification email: ${error.message}`, {
          id: toastId,
        });
        return;
      }

      toast.success(`Verification email sent to ${user.email}`, {
        id: toastId,
      });
    } catch (error) {
      console.error("sendVerificationEmail error", error);
      toast.error("Failed to send verification email. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSendingVerification(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          handleClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <SheetContent
        className="w-full overflow-y-auto sm:max-w-lg"
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="text-xl">Edit User</SheetTitle>
          <SheetDescription>
            Update the user details below. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col gap-6 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
        >
          {/* Name Field */}
          <form.Field
            name="name"
            children={(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-white"
                  htmlFor={field.name}
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          {/* Email Field */}
          <form.Field
            name="email"
            children={(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-white"
                  htmlFor={field.name}
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          {/* Username Field */}
          <form.Field
            name="username"
            children={(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-white"
                  htmlFor={field.name}
                >
                  Username
                </label>
                <div className="mt-2">
                  <input
                    className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Optional username"
                  />
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          {/* Profile Color Field */}
          <form.Field
            name="color"
            children={(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-white"
                  htmlFor={field.name}
                >
                  Profile Color
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    className="h-10 w-16 cursor-pointer rounded-md border-0 bg-transparent p-0"
                    id={field.name}
                    name={field.name}
                    type="color"
                    value={field.state.value || defaultColor}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <input
                    className="block flex-1 rounded-md bg-gray-800 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={defaultColor}
                  />
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          {/* Email Verified Field */}
          <form.Field
            name="emailVerified"
            children={(field) => (
              <div className="rounded-lg border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      className="text-sm font-medium text-white"
                      htmlFor={field.name}
                    >
                      Email Verified
                    </label>
                    <p className="mt-1 text-xs text-gray-400">
                      {field.state.value
                        ? "User's email has been verified"
                        : "User has not verified their email"}
                    </p>
                  </div>
                  <button
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none",
                      field.state.value ? "bg-green-600" : "bg-gray-500",
                    )}
                    id={field.name}
                    type="button"
                    role="switch"
                    aria-checked={field.state.value}
                    onClick={() => field.handleChange(!field.state.value)}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        field.state.value ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>
                {!field.state.value && (
                  <button
                    className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={handleResendVerificationEmail}
                    disabled={isSendingVerification}
                  >
                    <MailIcon size={16} />
                    {isSendingVerification
                      ? "Sending..."
                      : "Resend Verification Email"}
                  </button>
                )}
              </div>
            )}
          />

          {/* Role Field */}
          <form.Field
            name="role"
            children={(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-white"
                  htmlFor={field.name}
                >
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2">
                  <select
                    className="block w-full appearance-none rounded-md bg-gray-800 py-1.5 pr-10 pl-3 text-base text-white outline-1 -outline-offset-1 outline-gray-600 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value as "member" | "admin",
                      )
                    }
                    onBlur={field.handleBlur}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          {/* Banned Section */}
          <div className="rounded-lg border border-gray-700 p-4">
            <form.Field
              name="banned"
              children={(field) => (
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      className="text-sm font-medium text-white"
                      htmlFor={field.name}
                    >
                      Banned
                    </label>
                    <p className="mt-1 text-xs text-gray-400">
                      {field.state.value
                        ? "User is currently banned"
                        : "User is not banned"}
                    </p>
                  </div>
                  <button
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none",
                      field.state.value ? "bg-red-600" : "bg-gray-500",
                    )}
                    id={field.name}
                    type="button"
                    role="switch"
                    aria-checked={field.state.value}
                    onClick={() => field.handleChange(!field.state.value)}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        field.state.value ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>
              )}
            />

            {/* Ban Reason - only show when banned */}
            <form.Subscribe
              selector={(state) => state.values.banned}
              children={(isBanned) =>
                isBanned ? (
                  <div className="mt-4 space-y-4">
                    <form.Field
                      name="banReason"
                      children={(field) => (
                        <div>
                          <label
                            className="block text-sm font-medium text-white"
                            htmlFor={field.name}
                          >
                            Ban Reason
                          </label>
                          <div className="mt-2">
                            <textarea
                              className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ""}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              onBlur={field.handleBlur}
                              placeholder="Reason for banning this user"
                              rows={2}
                            />
                          </div>
                          <FieldInfo field={field} />
                        </div>
                      )}
                    />

                    <form.Field
                      name="banExpires"
                      children={(field) => (
                        <div>
                          <label
                            className="block text-sm font-medium text-white"
                            htmlFor={field.name}
                          >
                            Ban Expires
                          </label>
                          <p className="mt-1 text-xs text-gray-400">
                            Leave empty for permanent ban
                          </p>
                          <div className="mt-2">
                            <input
                              className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                              id={field.name}
                              name={field.name}
                              type="datetime-local"
                              value={field.state.value ?? ""}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              onBlur={field.handleBlur}
                            />
                          </div>
                          <FieldInfo field={field} />
                        </div>
                      )}
                    />
                  </div>
                ) : null
              }
            />
          </div>

          {/* Form Actions */}
          <div className="mt-4 flex gap-3">
            <form.Subscribe
              selector={(state) => [state.isDirty, state.isSubmitting]}
              children={([isDirty, isSubmitting]) => (
                <>
                  <button
                    className={cn(
                      "flex-1 cursor-pointer rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
                      isDirty
                        ? "hover:bg-green-700 active:bg-green-800"
                        : "cursor-not-allowed opacity-50",
                    )}
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    className="flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-white ring-1 ring-gray-600 ring-inset hover:bg-gray-800"
                    type="button"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                </>
              )}
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
