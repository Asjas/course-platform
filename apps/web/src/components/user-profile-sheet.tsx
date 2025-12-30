import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@packages/shared-ui/components/avatar";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FieldInfo from "~/components/field-info";
import Loading from "~/components/loading";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { authClient } from "~/lib/auth.client";
import { useAuth } from "~/lib/auth.context";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

interface UserProfileSheetProps {
  userName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserProfileSheet({
  userName,
  open,
  onOpenChange,
}: UserProfileSheetProps) {
  const auth = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile data
  const {
    data: userProfile,
    isLoading,
    refetch,
  } = useQuery({
    ...trpc.users.getUserProfile.queryOptions({ name: userName || "" }),
    enabled: !!userName && open,
  });

  // Check if this is the current user's profile
  const isOwnProfile =
    auth.session?.user.name === userName ||
    auth.session?.user.name === userProfile?.name;

  const form = useForm({
    defaultValues: {
      name: userProfile?.name || "",
      username: userProfile?.username || "",
    },
    onSubmit: async ({ value }) => {
      if (!isOwnProfile || !auth.session) return;

      setIsSaving(true);
      const toastId = toast.loading("Updating profile...");

      try {
        await authClient.updateUser({
          name: value.name,
          username: value.username || undefined,
        });

        toast.success("Profile updated successfully!", { id: toastId });
        setIsEditing(false);
        refetch();
      } catch (error) {
        console.error("Update profile error", error);
        toast.error("Failed to update profile. Please try again.", {
          id: toastId,
        });
      } finally {
        setIsSaving(false);
      }
    },
  });

  // Reset form and editing state when user profile changes or sheet opens/closes
  useEffect(() => {
    if (userProfile && open) {
      form.reset({
        name: userProfile.name,
        username: userProfile.username || "",
      });
      setIsEditing(false);
    }
  }, [userProfile, open, form]);

  function handleClose() {
    form.reset();
    setIsEditing(false);
    onOpenChange(false);
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (!userName) {
    return null;
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
        className="flex w-full flex-col sm:max-w-md"
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="text-xl">User Profile</SheetTitle>
          <SheetDescription>
            View user information and profile details.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : userProfile ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
              {/* Profile Header */}
              <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
                <Avatar className="h-24 w-24 ring-4 ring-gray-200 dark:ring-gray-700">
                  <AvatarImage
                    src={userProfile.image || undefined}
                    alt={userProfile.name}
                  />
                  <AvatarFallback
                    className="text-2xl font-semibold"
                    style={{
                      backgroundColor: userProfile.color
                        ? `#${userProfile.color}`
                        : "#6366f1",
                      color: "white",
                    }}
                  >
                    {getInitials(userProfile.name)}
                  </AvatarFallback>
                </Avatar>

                {isEditing ? (
                  <form
                    className="w-full space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      form.handleSubmit();
                    }}
                  >
                    <form.Field name="name">
                      {(field) => (
                        <div>
                          <label
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                            htmlFor={field.name}
                          >
                            Display Name
                          </label>
                          <div className="mt-1">
                            <input
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-gray-900 dark:text-white dark:outline-gray-700"
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
                      )}
                    </form.Field>

                    <form.Field name="username">
                      {(field) => (
                        <div>
                          <label
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                            htmlFor={field.name}
                          >
                            Username
                          </label>
                          <div className="mt-1">
                            <input
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-gray-900 dark:text-white dark:outline-gray-700"
                              id={field.name}
                              name={field.name}
                              type="text"
                              value={field.state.value}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              onBlur={field.handleBlur}
                              placeholder="Optional username"
                            />
                          </div>
                          <FieldInfo field={field} />
                        </div>
                      )}
                    </form.Field>

                    <div className="flex gap-2">
                      <button
                        className="flex-1 cursor-pointer rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        type="submit"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-100 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-800"
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          form.reset();
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {userProfile.displayUsername || userProfile.name}
                    </h3>
                    {userProfile.username && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{userProfile.username}
                      </p>
                    )}
                  </div>
                )}

                {/* Edit button for own profile */}
                {isOwnProfile && !isEditing && (
                  <button
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    type="button"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* User Details */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Profile Details
                </h4>
                <div className="space-y-3">
                  {/* Role */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      {userProfile.role === "admin" ? (
                        <ShieldCheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Role
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                            userProfile.role === "admin"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                          )}
                        >
                          {userProfile.role === "admin" ? "Admin" : "Member"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Member Since */}
                  {userProfile.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Member Since
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {format(
                            new Date(userProfile.createdAt),
                            "MMMM d, yyyy",
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Own Profile Actions */}
              {isOwnProfile && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Account Settings
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    To change your email, password, or other account settings,
                    visit your{" "}
                    <a
                      className="cursor-pointer font-medium text-green-600 hover:underline dark:text-green-400"
                      href="/account"
                    >
                      Account Settings
                    </a>{" "}
                    page.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-gray-300 p-4 dark:border-gray-700">
              <button
                className="flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-100 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-800"
                type="button"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">User not found.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
