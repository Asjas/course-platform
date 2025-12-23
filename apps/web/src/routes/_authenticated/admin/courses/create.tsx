import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import FieldInfo from "~/components/field-info";
import { useAuth } from "~/lib/auth.context";
import { queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/admin/courses/create")({
  component: CreateCoursePage,
});

function CreateCoursePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const userId = auth.session?.user?.id;

  const createCourseMutation = useMutation(
    trpc.courses.createCourse.mutationOptions(),
  );

  const form = useForm({
    defaultValues: {
      slug: "",
      name: "",
      description: "",
      level: "All levels" as
        | "All levels"
        | "Beginner"
        | "Intermediate"
        | "Advanced",
      thumbnailUrl: "",
      published: false,
      isFree: false,
      price: 19,
      priceCurrency: "USD",
      isSaleActive: false,
      salePrice: 0,
      trialModuleLimit: 0,
      authorId: userId || "",
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading(`Creating course ${value.name}...`);

      try {
        const newCourse = await createCourseMutation.mutateAsync({
          ...value,
          description: value.description || null,
          thumbnailUrl: value.thumbnailUrl || null,
          saleStartAt: null,
          saleExpiresAt: null,
        });

        queryClient.invalidateQueries({
          queryKey: ["admin", "courses"],
        });

        toast.success(`Course ${newCourse.name} created successfully!`, {
          id: toastId,
        });

        // Navigate to edit page
        navigate({
          to: "/admin/courses/$courseId/edit",
          params: { courseId: newCourse.id },
        });
      } catch (error) {
        console.error("createCourse error", error);
        toast.error("Failed to create course. Please try again.", {
          id: toastId,
        });
      }
    },
  });

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <Link
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              to="/admin/courses"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              Create New Course
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill in the course details below
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Form */}
        <div className="flex-1 overflow-y-auto bg-white p-8 dark:bg-gray-800">
          <form
            className="mx-auto max-w-2xl space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
          <form.Field name="name">
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="name"
                >
                  Course Name *
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  id="name"
                  name="name"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
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
                  htmlFor="slug"
                >
                  URL Slug *
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  id="slug"
                  name="slug"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="my-awesome-course"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This will be used in the URL: /courses/
                  {field.state.value || "your-slug"}
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
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  id="description"
                  name="description"
                  rows={4}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="A brief description of what students will learn..."
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <form.Field name="level">
              {(field) => (
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    htmlFor="level"
                  >
                    Level
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    id="level"
                    name="level"
                    value={field.state.value}
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
                    htmlFor="thumbnailUrl"
                  >
                    Thumbnail URL
                  </label>
                  <input
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    type="url"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://..."
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>
          </div>

          <div className="space-y-4 rounded-md border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Pricing
            </h3>

            <form.Field name="isFree">
              {(field) => (
                <div className="flex items-center">
                  <input
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                    id="isFree"
                    name="isFree"
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  <label
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                    htmlFor="isFree"
                  >
                    This is a free course
                  </label>
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => !state.values.isFree}>
              {(showPrice) =>
                showPrice && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <form.Field name="price">
                      {(field) => (
                        <div>
                          <label
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            htmlFor="price"
                          >
                            Price ($)
                          </label>
                          <input
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(Number(e.target.value))
                            }
                          />
                          <FieldInfo field={field} />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="trialModuleLimit">
                      {(field) => (
                        <div>
                          <label
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            htmlFor="trialModuleLimit"
                          >
                            Free Trial Modules
                          </label>
                          <input
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            id="trialModuleLimit"
                            name="trialModuleLimit"
                            type="number"
                            min="0"
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(Number(e.target.value))
                            }
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Number of modules available for free preview
                          </p>
                          <FieldInfo field={field} />
                        </div>
                      )}
                    </form.Field>
                  </div>
                )
              }
            </form.Subscribe>
          </div>

          <form.Field name="published">
            {(field) => (
              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                  id="published"
                  name="published"
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
                <label
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  htmlFor="published"
                >
                  Publish course immediately
                </label>
              </div>
            )}
          </form.Field>

          <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <button
              className="inline-flex cursor-pointer items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={form.state.isSubmitting}
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {form.state.isSubmitting ? "Creating..." : "Create Course"}
            </button>
            <Link
              className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              to="/admin/courses"
            >
              Cancel
            </Link>
          </div>
        </form>
        </div>

        {/* Right Column - Preview */}
        <div className="w-96 flex-shrink-0 border-l border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
            Course Structure
          </h3>
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                After creating the course, you'll be able to add modules and lessons using the drag-and-drop editor.
              </p>
            </div>
            <div className="space-y-2">
              <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                <div className="mb-2 flex items-center">
                  <div className="h-5 w-5 rounded bg-green-100 dark:bg-green-900"></div>
                  <div className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Module 1
                  </div>
                </div>
                <div className="ml-7 space-y-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">→ Lesson 1</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">→ Lesson 2</div>
                </div>
              </div>
              <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                <div className="mb-2 flex items-center">
                  <div className="h-5 w-5 rounded bg-green-100 dark:bg-green-900"></div>
                  <div className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Module 2
                  </div>
                </div>
                <div className="ml-7 space-y-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">→ Lesson 1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
