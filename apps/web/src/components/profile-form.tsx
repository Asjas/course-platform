import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { UserCircleIcon } from "lucide-react";
import * as z from "zod";
import { authClient } from "~/lib/auth.client.ts";
import { useAuth } from "~/lib/auth.context.ts";
import { trpc } from "~/lib/trpc.client.ts";
import { cn } from "~/lib/utils.ts";

function FieldInfo({ field }: { field: AnyFieldApi }) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const meta = field.state.meta;

  return (
    <>
      {isInvalid ? <em>{meta.errors.join(", ")}</em> : null}
      {meta.isValidating ? "Validating..." : null}
    </>
  );
}

const formSchema = z.object({
  name: z.string().trim(),
  username: z.string().trim().nullable().optional(),
  image: z.string().nullable().optional(),
});

export default function ProfileForm() {
  const auth = useAuth();
  const user = auth.session?.user;
  const signedUrlMutation = useMutation(
    trpc.profile.getPresignedUrl.mutationOptions(),
  );

  const form = useForm({
    defaultValues: {
      username: user?.username ?? "",
      name: user?.name ?? "",
      image: user?.image ?? null,
    } as z.infer<typeof formSchema>,
    validators: {
      onBlur: formSchema,
    },
    onSubmit: async ({ value: { username, name, image } }) => {
      const { error } = await authClient.updateUser({
        name,
        username,
        image,
      });

      if (error) {
        form.setFieldMeta("username", (oldMeta) => ({
          ...oldMeta,
          isTouched: true,
          errorMap: { onSubmit: error },
        }));
      }

      form.reset({ username, name, image });
    },
  });

  return (
    <form
      className="mt-20 flex flex-col px-4 md:px-6 lg:px-8"
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
                  Profile
                </h2>
                <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                  This information will be displayed publicly so be careful what
                  you share.
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
                  type="button"
                  disabled={!isDirty}
                  onClick={() => form.reset()}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      />

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
                      Name
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                        id={field.name}
                        required
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
            {/* Image Upload Field */}
            <form.Field
              name="image"
              children={(field) => (
                <div className="flex flex-col">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor={field.name}
                  >
                    Photo
                  </label>
                  <div className="mt-2 flex flex-col items-start md:flex-row md:items-center md:gap-4">
                    {user?.image ? (
                      <img
                        className="size-12 rounded-full bg-gray-50 object-cover dark:bg-gray-800"
                        src={user.image}
                        alt="profile"
                      />
                    ) : (
                      <UserCircleIcon
                        className="size-12 text-gray-300 dark:text-gray-500"
                        aria-hidden="true"
                      />
                    )}
                    <input
                      className="mt-4 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-none inset-ring inset-ring-white/5 hover:bg-white/20 md:mt-0"
                      id={field.name}
                      type="file"
                      name={field.name}
                      accept="image/jpeg,image/png"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        const extension = file.name.split(".").pop() || "jpg";
                        const filename = `${crypto.randomUUID()}.${extension}`;

                        // Request presigned URL from backend
                        const { presignedUrl, publicUrl } =
                          await signedUrlMutation.mutateAsync({
                            filename,
                            contentType: file.type,
                          });

                        console.log({ presignedUrl, publicUrl });

                        // Upload directly to R2
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

                        // Set the public URL as the field value
                        field.handleChange(publicUrl);
                      }}
                      onBlur={field.handleBlur}
                    />
                    <FieldInfo field={field} />
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        <div className="w-full px-4 pb-12"></div>
      </div>
    </form>
  );
}
