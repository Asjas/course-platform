import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import FieldInfo from "~/components/field-info";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useAuth } from "~/lib/auth.context";
import { queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";
import { createCourseSchema } from "~/schema/course";

interface CreateCourseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCourseSheet({
  open,
  onOpenChange,
}: CreateCourseSheetProps) {
  const auth = useAuth();
  const userId = auth.session?.user?.id;

  const createCourseMutation = useMutation(
    trpc.courses.createCourse.mutationOptions(),
  );

  const form = useForm({
    defaultValues: {
      slug: "",
      name: "",
      description: null as string | null,
      level: "All levels" as
        | "All levels"
        | "Beginner"
        | "Intermediate"
        | "Advanced",
      thumbnailUrl: null as string | null,
      published: false,
      isFree: false,
      price: 19,
      priceCurrency: "USD",
      isSaleActive: false,
      salePrice: 0,
      saleStartAt: null as Date | null,
      saleExpiresAt: null as Date | null,
      trialModuleLimit: 0,
      authorId: userId || "",
    },
    validators: {
      onSubmit: createCourseSchema,
      onBlur: createCourseSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading(`Creating course ${value.name}...`);

      try {
        const newCourse = await createCourseMutation.mutateAsync(value);

        queryClient.invalidateQueries({
          queryKey: ["admin", "courses"],
        });

        toast.success(`Course ${newCourse.name} created successfully!`, {
          id: toastId,
        });

        form.reset();
        onOpenChange(false);
      } catch (error) {
        console.error("createCourse error", error);
        toast.error("Failed to create course. Please try again.", {
          id: toastId,
        });
      }
    },
  });

  const resetForm = useCallback(() => {
    form.reset({
      slug: "",
      name: "",
      description: null as string | null,
      level: "All levels" as
        | "All levels"
        | "Beginner"
        | "Intermediate"
        | "Advanced",
      thumbnailUrl: null as string | null,
      published: false,
      isFree: false,
      price: 19,
      priceCurrency: "USD",
      isSaleActive: false,
      salePrice: 0,
      saleStartAt: null as Date | null,
      saleExpiresAt: null as Date | null,
      trialModuleLimit: 0,
      authorId: userId || "",
    });
  }, [form, userId]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent className="w-full max-w-3xl overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Create New Course</SheetTitle>
          <SheetDescription>
            Create a new course with basic information. You can add modules and
            lessons after creation.
          </SheetDescription>
        </SheetHeader>

        <form
          className="mt-6 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor={field.name}
                >
                  Course Name *
                </label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  id={field.name}
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Introduction to Fastify"
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="slug">
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor={field.name}
                >
                  Slug *
                </label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  id={field.name}
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="introduction-to-fastify"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lowercase letters, numbers, and hyphens only
                </p>
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor={field.name}
                >
                  Description
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  rows={3}
                  placeholder="A comprehensive introduction to building APIs with Fastify"
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="level">
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor={field.name}
                >
                  Level
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value as
                        | "All levels"
                        | "Beginner"
                        | "Intermediate"
                        | "Advanced",
                    )
                  }
                >
                  <option value="All levels">All levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="thumbnailUrl">
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor={field.name}
                >
                  Thumbnail URL
                </label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  id={field.name}
                  type="url"
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  placeholder="https://example.com/thumbnail.jpg"
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="isFree">
              {(field) => (
                <div className="flex items-center">
                  <input
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800"
                    id={field.name}
                    type="checkbox"
                    name={field.name}
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  <label
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    htmlFor={field.name}
                  >
                    Free Course
                  </label>
                </div>
              )}
            </form.Field>

            <form.Field name="published">
              {(field) => (
                <div className="flex items-center">
                  <input
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800"
                    id={field.name}
                    type="checkbox"
                    name={field.name}
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  <label
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    htmlFor={field.name}
                  >
                    Published
                  </label>
                </div>
              )}
            </form.Field>
          </div>

          <form.Subscribe
            selector={(state) => [state.values.isFree]}
            children={([isFree]) => {
              if (isFree) return null;

              return (
                <div className="grid grid-cols-2 gap-4">
                  <form.Field name="price">
                    {(field) => (
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          htmlFor={field.name}
                        >
                          Price ($)
                        </label>
                        <input
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          id={field.name}
                          type="number"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          min="0"
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="salePrice">
                    {(field) => (
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          htmlFor={field.name}
                        >
                          Sale Price ($)
                        </label>
                        <input
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          id={field.name}
                          type="number"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          min="0"
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                </div>
              );
            }}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              className={cn(
                "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              )}
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              className={cn(
                "rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50",
              )}
              type="submit"
              disabled={createCourseMutation.isPending}
            >
              {createCourseMutation.isPending ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
