import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { UserCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import BlockerComponent from "~/components/blocker";
import FieldInfo from "~/components/field-info";
import { authClient } from "~/lib/auth.client";
import { useAuth } from "~/lib/auth.context";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";
import { profileFormSchema } from "~/schema/profile-form";

// Extended user type to include server-side additionalFields
interface ExtendedUser {
  color?: string | null;
}

export default function ProfileForm() {
  const auth = useAuth();
  const user = auth.session?.user as
    | (NonNullable<typeof auth.session>["user"] & ExtendedUser)
    | undefined;
  const [isUploading, setIsUploading] = useState(false);
  const signedUrlMutation = useMutation(
    trpc.images.getPresignedUrl.mutationOptions({ keyPrefix: undefined }),
  );

  const form = useForm({
    defaultValues: {
      username: user?.username ?? "",
      name: user?.name ?? "",
      color: user?.color ? `#${user.color}` : "",
      image: user?.image ?? null,
    } as z.infer<typeof profileFormSchema>,
    validators: {
      onBlur: profileFormSchema,
      onSubmit: profileFormSchema,
    },
    onSubmit: async ({ value: { username, name, color, image } }) => {
      const toastId = toast.loading("Updating profile...");

      // Workaround: authClient.updateUser promise hangs even though the API call succeeds
      // Using Promise.race with a timeout to handle this issue
      // See: https://github.com/better-auth/better-auth/issues/XXXX
      const updatePromise = authClient.updateUser({
        name,
        username,
        color: color ? color.replace("#", "") : undefined,
        image,
      } as Parameters<typeof authClient.updateUser>[0]);

      const timeoutPromise = new Promise<{ error: null }>((resolve) =>
        setTimeout(() => resolve({ error: null }), 1500),
      );

      const { error } = await Promise.race([updatePromise, timeoutPromise]);

      if (error) {
        form.setFieldMeta("username", (oldMeta) => ({
          ...oldMeta,
          isTouched: true,
          errorMap: { onSubmit: error },
        }));

        toast.error(error.message || "Failed to update profile", {
          id: toastId,
        });
        return;
      }

      form.reset({ username, name, color, image });
      toast.success("Profile updated successfully!", { id: toastId });
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
        selector={(state) => [state.isDirty]}
        children={([isDirty]) => <BlockerComponent formIsDirty={isDirty} />}
      />

      <div className="flex">
        <div className="flex w-full flex-col justify-between">
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
                  {isSubmitting ? "Saving..." : "Save"}
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

      <div className="flex flex-col justify-between gap-6">
        <div className="w-full lg:pb-12">
          <div className="mt-10 flex flex-col gap-x-6 gap-y-8">
            {/* Name Field */}
            <form.Field
              name="name"
              children={(field) => {
                return (
                  <div className="col-span-3">
                    <label
                      className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Name (Required)
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                        id={field.name}
                        name={field.name}
                        type="text"
                        autoComplete="name"
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

            {/* Username Field */}
            <form.Field
              name="username"
              children={(field) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor={field.name}
                  >
                    Username
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-indigo-500">
                      <input
                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-transparent dark:text-white dark:placeholder:text-gray-500"
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="janesmith"
                        autoComplete="username"
                        value={field.state.value ?? ""}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                </div>
              )}
            />

            {/* Profile Color Field */}
            <form.Field
              name="color"
              children={(field) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor={field.name}
                  >
                    Profile Color
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      className="size-10 cursor-pointer rounded-md border-0 bg-transparent p-0"
                      id={field.name}
                      name={field.name}
                      type="color"
                      value={
                        field.state.value ||
                        (user?.color ? `#${user.color}` : "#808080")
                      }
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                    />
                    <input
                      className="block w-28 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 uppercase outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      type="text"
                      placeholder="#808080"
                      value={field.state.value || ""}
                      onChange={(event) => {
                        let value = event.target.value;
                        if (!value.startsWith("#")) {
                          value = `#${value}`;
                        }
                        field.handleChange(value.toUpperCase());
                      }}
                      onBlur={field.handleBlur}
                      aria-label="Hex color value"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Your username color in the chat
                    </span>
                  </div>
                  <FieldInfo field={field} />
                </div>
              )}
            />

            {/* Image Upload Field */}
            <form.Field
              name="image"
              children={(field) => (
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <label
                      className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Photo
                    </label>
                    <div className="ml-6 items-center">
                      {isUploading && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Uploading image...
                        </span>
                      )}
                      <FieldInfo field={field} />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col items-start md:flex-row md:items-center md:gap-4">
                    {user?.image ? (
                      <form.Subscribe
                        selector={(state) => [state.values.image]}
                        children={([image]) => (
                          <img
                            className="size-12 rounded-full bg-gray-50 object-cover dark:bg-gray-800"
                            src={image || (user.image as string)}
                            alt="Your profile"
                          />
                        )}
                      />
                    ) : (
                      <UserCircleIcon
                        className="size-12 text-gray-300 dark:text-gray-500"
                        aria-hidden="true"
                      />
                    )}
                    <div className="flex flex-col gap-2">
                      <input
                        className="mt-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-none inset-ring inset-ring-white/5 hover:bg-white/20 md:mt-0"
                        id={field.name}
                        type="file"
                        name={field.name}
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;

                          const extension = file.name.split(".").pop() || "jpg";
                          const filename = `${user?.id}.${extension}`;
                          const key = `profile_images/${filename}`;

                          const { presignedUrl, publicUrl } =
                            await signedUrlMutation.mutateAsync({
                              key,
                              contentType: file.type,
                            });

                          setIsUploading(true);

                          try {
                            const uploadResponse = await fetch(presignedUrl, {
                              method: "PUT",
                              body: file,
                              headers: {
                                "Content-Type": file.type,
                              },
                            });

                            if (!uploadResponse.ok) {
                              throw new Error(
                                `Upload failed: ${uploadResponse.statusText}`,
                              );
                            }

                            field.handleChange(publicUrl);
                          } catch (error) {
                            if (error instanceof Error) {
                              form.setFieldMeta("image", (oldMeta) => ({
                                ...oldMeta,
                                isTouched: true,
                                errorMap: { onSubmit: error },
                              }));

                              toast.error(
                                error.message || "Failed to upload image",
                              );
                            }
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                        onBlur={field.handleBlur}
                      />
                    </div>
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
