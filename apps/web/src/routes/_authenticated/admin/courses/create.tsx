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
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <Link
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          to="/admin/courses"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Create New Course
        </h1>

        <form
          className="space-y-6"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
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
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-900"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
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
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-900"
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
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
              type="submit"
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              Create Course
            </button>
            <Link
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              to="/admin/courses"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
