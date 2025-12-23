import { SelectInput } from "@packages/shared-ui/components/select-input";
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
      description: null,
      level: "All levels",
      thumbnailUrl: null,
      published: false,
      isFree: false,
      price: 19,
      priceCurrency: "USD",
      isSaleActive: false,
      salePrice: 0,
      saleStartAt: null,
      saleExpiresAt: null,
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-3xl overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Create New Course</SheetTitle>
          <SheetDescription>
            Create a new course with basic information. You can add modules and
            lessons after creation.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="mt-6 space-y-6"
        >
          <form.Field name="name">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Course Name *
                </label>
                <input
                  type="text"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Slug *
                </label>
                <input
                  type="text"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Level
                </label>
                <SelectInput
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
                  className="mt-1"
                >
                  <option value="All levels">All levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </SelectInput>
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="thumbnailUrl">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label
                    htmlFor={field.name}
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
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
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label
                    htmlFor={field.name}
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
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
                          htmlFor={field.name}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Price ($)
                        </label>
                        <input
                          type="number"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="salePrice">
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Sale Price ($)
                        </label>
                        <input
                          type="number"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCourseMutation.isPending}
              className={cn(
                "rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50",
              )}
            >
              {createCourseMutation.isPending ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
