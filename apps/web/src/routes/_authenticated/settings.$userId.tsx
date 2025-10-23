import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UserCircleIcon } from "lucide-react";
import { useEffect } from "react";
import * as z from "zod";
import { trpc } from "~/lib/trpc.client.ts";
import { cn } from "~/lib/utils.ts";

export const Route = createFileRoute("/_authenticated/settings/$userId")({
  component: SettingsComponent,
});

const formSchema = z.object({
  name: z.string().trim(),
  username: z.string().trim().nullable(),
  email: z.email().trim(),
  metadata: z.string().max(500).trim().nullable(),
  country: z.string().max(100).trim().nullable(),
  image: z.string().nullable(),
});

function SettingsComponent() {
  const { queryClient } = Route.useRouteContext();
  const params = Route.useParams();
  const userUpdater = useMutation(trpc.users.updateUserById.mutationOptions());
  const {
    data: user,
    isLoading,
    error,
  } = useQuery(trpc.users.getUserById.queryOptions({ userId: params.userId }));

  const form = useForm({
    defaultValues: {
      username: null,
      name: "",
      email: "",
      metadata: null,
      image: null,
      country: null,
    } as z.infer<typeof formSchema>,
    validators: {
      onBlur: formSchema,
    },
    onSubmit: async ({
      value: { username, name, email, metadata, image, country },
    }) => {
      userUpdater.mutate(
        {
          id: params.userId,
          username,
          name,
          email,
          metadata,
          image,
          country,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: trpc.users.getUserById.queryOptions({
                userId: params.userId,
              }).queryKey,
            });
          },
        },
      );
    },
  });

  useEffect(() => {
    // useQuery might return undefined data initially
    if (!user) return;

    form.reset({
      username: user.username,
      name: user.name,
      email: user.email,
      metadata: user.metadata,
      image: user.image,
      country: user.country,
    });
  }, [user, form]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-600">
        Error: {error.message}
      </div>
    );
  }

  return (
    <form
      className="mt-20 flex flex-col px-12"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      noValidate
    >
      <form.Subscribe
        selector={(state) => state.isDirty}
        children={(isDirty) => (
          <div className="flex">
            <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
              <div className="mb-4 flex flex-col">
                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                  Profile
                </h2>
                <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                  This information will be displayed publicly so be careful what
                  you share.
                </p>
              </div>

              <div className="flex gap-2 lg:justify-end">
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
                  Save
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

      <div className="flex flex-col justify-between gap-6 lg:mt-10 lg:flex-row lg:gap-20 lg:space-y-12">
        <div className="w-full lg:pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <form.Field
              name="name"
              children={({ state, handleChange, handleBlur }) => (
                <div className="sm:col-span-3">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <div className="mt-2">
                    <input
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={state.value}
                      onChange={(event) => handleChange(event.target.value)}
                      onBlur={handleBlur}
                      aria-invalid={
                        state.meta.errors.length > 0 ? "true" : "false"
                      }
                      aria-describedby={
                        state.meta.errors.length > 0 ? "name-error" : undefined
                      }
                    />
                  </div>
                  {state.meta.errors && (
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="name-error"
                    >
                      {state.meta.errors
                        .map((error) => error?.message)
                        .join(", ")}
                    </p>
                  )}
                </div>
              )}
            />

            <form.Field
              name="email"
              children={({ state, handleChange, handleBlur }) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor="email"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={state.value}
                      onChange={(event) => handleChange(event.target.value)}
                      onBlur={handleBlur}
                      aria-invalid={
                        state.meta.errors.length > 0 ? "true" : "false"
                      }
                      aria-describedby={
                        state.meta.errors.length > 0 ? "email-error" : undefined
                      }
                    />
                  </div>
                  {state.meta.errors && (
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="email-error"
                    >
                      {state.meta.errors
                        .map((error) => error?.message)
                        .join(", ")}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Username Field */}
            <form.Field
              name="username"
              children={({ state, handleChange, handleBlur }) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-indigo-500">
                      <input
                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-transparent dark:text-white dark:placeholder:text-gray-500"
                        id="username"
                        name="username"
                        type="text"
                        placeholder="janesmith"
                        autoComplete="username"
                        value={state.value ?? ""}
                        onChange={(event) => handleChange(event.target.value)}
                        onBlur={handleBlur}
                        aria-invalid={
                          state.meta.errors.length > 0 ? "true" : "false"
                        }
                        aria-describedby={
                          state.meta.errors.length > 0
                            ? "username-error"
                            : undefined
                        }
                      />
                    </div>
                    {state.meta.errors && (
                      <p
                        className="mt-2 text-sm text-red-600"
                        id="username-error"
                      >
                        {state.meta.errors
                          .map((error) => error?.message)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        <div className="w-full pb-12">
          {/* Image Upload Field */}
          <form.Field
            name="image"
            children={({ state, handleChange, handleBlur }) => (
              <div className="col-span-full">
                <label
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                  htmlFor="photo"
                >
                  Photo
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  {user?.image ? (
                    <img
                      className="size-12 rounded-full bg-gray-50 object-cover dark:bg-gray-800"
                      src={`data:image/jpeg;base64,${user.image}`}
                      alt="profile"
                    />
                  ) : (
                    <UserCircleIcon
                      className="size-12 text-gray-300 dark:text-gray-500"
                      aria-hidden="true"
                    />
                  )}
                  <input
                    className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-none inset-ring inset-ring-white/5 hover:bg-white/20"
                    id="photo"
                    type="file"
                    name="photo"
                    accept="image/jpeg,image/png"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;

                      // Convert file to base64
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64String = reader.result
                          ?.toString()
                          .split(",")[1]; // Remove data:image/jpeg;base64, prefix

                        handleChange(base64String ?? null);
                      };

                      reader.readAsDataURL(file);
                    }}
                    onBlur={handleBlur}
                    aria-invalid={
                      state.meta.errors.length > 0 ? "true" : "false"
                    }
                    aria-describedby={
                      state.meta.errors.length > 0 ? "image-error" : undefined
                    }
                  />
                  {state.meta.errors && (
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="image-error"
                    >
                      {state.meta.errors
                        .map((error) => error?.message)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            )}
          />

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <form.Field
              name="country"
              children={({ state, handleChange, handleBlur }) => (
                <div className="sm:col-span-3">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor="country"
                  >
                    Country
                  </label>
                  <div className="mt-2">
                    <input
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      id="country"
                      name="country"
                      type="text"
                      autoComplete="country"
                      value={state.value ?? ""}
                      onChange={(event) => handleChange(event.target.value)}
                      onBlur={handleBlur}
                      aria-invalid={
                        state.meta.errors.length > 0 ? "true" : "false"
                      }
                      aria-describedby={
                        state.meta.errors.length > 0
                          ? "country-error"
                          : undefined
                      }
                    />
                  </div>
                  {state.meta.errors && (
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="country-error"
                    >
                      {state.meta.errors
                        .map((error) => error?.message)
                        .join(", ")}
                    </p>
                  )}
                </div>
              )}
            />

            <form.Field
              name="metadata"
              children={({ state, handleChange, handleBlur }) => (
                <div className="col-span-full">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor="metadata"
                  >
                    About
                  </label>
                  <div className="mt-2">
                    <textarea
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      id="metadata"
                      name="metadata"
                      rows={4}
                      value={state.value ?? ""}
                      onChange={(event) => handleChange(event.target.value)}
                      onBlur={handleBlur}
                      aria-invalid={
                        state.meta.errors.length > 0 ? "true" : "false"
                      }
                      aria-describedby={
                        state.meta.errors.length > 0
                          ? "metadata-error"
                          : undefined
                      }
                    />
                  </div>
                  {state.meta.errors && (
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="metadata-error"
                    >
                      {state.meta.errors
                        .map((error) => error?.message)
                        .join(", ")}
                    </p>
                  )}
                  <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                    Write a few sentences about yourself.
                  </p>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
