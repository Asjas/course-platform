import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeftIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CourseEditorSidebar from "~/components/course-editor-sidebar";
import FieldInfo from "~/components/field-info";
import Loading from "~/components/loading";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";
import {
  type CreateLessonFormData,
  type UpdateLessonFormData,
  createLessonSchema,
  updateLessonSchema,
} from "~/schema/lesson";
import {
  type CreateModuleFormData,
  type UpdateModuleFormData,
  createModuleSchema,
  updateModuleSchema,
} from "~/schema/module";

export const Route = createFileRoute(
  "/_authenticated/admin/courses/$courseId/edit",
)({
  component: EditCoursePage,
  loader: async () => {
    // Preload course data
    await trpcClient.courses.getAllAsAdmin.query();
  },
});

function EditCoursePage() {
  const { courseId } = Route.useParams();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<
    "module" | "lesson" | null
  >(null);

  // Using TanStack Query instead of collections for now
  const { data: courses, isLoading } = useQuery(
    trpc.courses.getAllAsAdmin.queryOptions(),
  );

  const course = courses?.find((c) => c.id === courseId);

  function handleSelectItem(itemId: string, type: "module" | "lesson") {
    setSelectedItemId(itemId);
    setSelectedItemType(type);
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Course not found
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            The course you're looking for doesn't exist.
          </p>
          <Link
            className="mt-4 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            to="/admin/courses"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const modules = course.modules || [];
  const lessons = course.lessons || [];

  function handleModulesReordered(updatedModules: typeof modules) {
    // Optimistic update handled by queryClient invalidation
  }

  function handleLessonsReordered(updatedLessons: typeof lessons) {
    // Optimistic update handled by queryClient invalidation
  }

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
              {course.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Edit course structure, modules, and lessons
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <CourseEditorSidebar
            lessons={lessons}
            modules={modules}
            onLessonsReordered={handleLessonsReordered}
            onModulesReordered={handleModulesReordered}
            onSelectItem={handleSelectItem}
            selectedItemId={selectedItemId}
          />
        </div>

        {/* Content Editor */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8 dark:bg-gray-900">
          {selectedItemId && selectedItemType === "module" ? (
            <ModuleEditor
              courseId={courseId}
              moduleId={selectedItemId === "new-module" ? null : selectedItemId}
            />
          ) : selectedItemId && selectedItemType === "lesson" ? (
            <LessonEditor
              courseId={courseId}
              lessonId={selectedItemId === "new-lesson" ? null : selectedItemId}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          No selection
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Select a module or lesson from the sidebar to edit its content
        </p>
      </div>
    </div>
  );
}

interface ModuleEditorProps {
  moduleId: string | null;
  courseId: string;
}

function ModuleEditor({ moduleId, courseId }: ModuleEditorProps) {
  const { data: courses } = useQuery(trpc.courses.getAllAsAdmin.queryOptions());
  const course = courses?.find((c) => c.id === courseId);
  const module = course?.modules?.find((m) => m.id === moduleId);

  const createModuleMutation = useMutation(
    trpc.courses.createModule.mutationOptions(),
  );
  const updateModuleMutation = useMutation(
    trpc.courses.updateModule.mutationOptions(),
  );
  const deleteModuleMutation = useMutation(
    trpc.courses.deleteModule.mutationOptions(),
  );

  const form = useForm<CreateModuleFormData | UpdateModuleFormData>({
    defaultValues:
      moduleId && module
        ? {
            id: module.id,
            title: module.title,
            slug: module.slug,
            description: module.description,
            order: module.order,
            isPreview: module.isPreview,
          }
        : {
            title: "",
            slug: "",
            description: "",
            order: course?.modules?.length || 0,
            isPreview: false,
            courseId,
          },
    validators: {
      onChange: moduleId ? updateModuleSchema : createModuleSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading(
        moduleId ? "Updating module..." : "Creating module...",
      );

      try {
        if (moduleId) {
          await updateModuleMutation.mutateAsync(value as UpdateModuleFormData);
          toast.success("Module updated successfully!", { id: toastId });
        } else {
          await createModuleMutation.mutateAsync(value as CreateModuleFormData);
          toast.success("Module created successfully!", { id: toastId });
        }

        await queryClient.invalidateQueries({
          queryKey: ["admin", "courses"],
        });
      } catch (error) {
        console.error("Module save error", error);
        toast.error("Failed to save module. Please try again.", {
          id: toastId,
        });
      }
    },
  });

  async function handleDelete() {
    if (!moduleId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this module? This will also delete all lessons in this module.",
    );
    if (!confirmed) return;

    const toastId = toast.loading("Deleting module...");

    try {
      await deleteModuleMutation.mutateAsync({ moduleId });
      toast.success("Module deleted successfully!", { id: toastId });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "courses"],
      });
    } catch (error) {
      console.error("Module delete error", error);
      toast.error("Failed to delete module. Please try again.", {
        id: toastId,
      });
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {moduleId ? "Edit Module" : "Create New Module"}
          </h2>
          {moduleId && (
            <button
              className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              onClick={handleDelete}
              type="button"
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              Delete Module
            </button>
          )}
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="title">
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="title"
                >
                  Module Title
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  id="title"
                  name="title"
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Introduction to React"
                  type="text"
                  value={field.state.value}
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
                  Slug
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  id="slug"
                  name="slug"
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="introduction-to-react"
                  type="text"
                  value={field.state.value}
                />
                <FieldInfo field={field} />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lowercase letters, numbers, and hyphens only
                </p>
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
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Learn the fundamentals of React..."
                  rows={4}
                  value={field.state.value}
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="isPreview">
            {(field) => (
              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  id="isPreview"
                  checked={field.state.value}
                  name="isPreview"
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  type="checkbox"
                />
                <label
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  htmlFor="isPreview"
                >
                  Allow preview (non-enrolled users can access)
                </label>
              </div>
            )}
          </form.Field>

          <div className="flex justify-end space-x-3">
            <button
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              disabled={form.state.isSubmitting}
              type="submit"
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {form.state.isSubmitting
                ? "Saving..."
                : moduleId
                  ? "Update Module"
                  : "Create Module"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface LessonEditorProps {
  lessonId: string | null;
  courseId: string;
  preselectedModuleId?: string;
}

function LessonEditor({
  lessonId,
  courseId,
  preselectedModuleId,
}: LessonEditorProps) {
  const { data: courses } = useQuery(trpc.courses.getAllAsAdmin.queryOptions());
  const course = courses?.find((c) => c.id === courseId);
  const lesson = course?.lessons?.find((l) => l.id === lessonId);

  const createLessonMutation = useMutation(
    trpc.courses.createLesson.mutationOptions(),
  );
  const updateLessonMutation = useMutation(
    trpc.courses.updateLesson.mutationOptions(),
  );
  const deleteLessonMutation = useMutation(
    trpc.courses.deleteLesson.mutationOptions(),
  );

  const form = useForm<CreateLessonFormData | UpdateLessonFormData>({
    defaultValues:
      lessonId && lesson
        ? {
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            videoUrl: lesson.videoUrl,
            videoProvider: lesson.videoProvider,
            content: lesson.content || {},
            transcription: lesson.transcription || {},
            duration: lesson.duration || null,
            order: lesson.order,
            isPreview: lesson.isPreview,
          }
        : {
            title: "",
            slug: "",
            videoUrl: "",
            videoProvider: "youtube" as const,
            content: {},
            transcription: {},
            duration: null,
            order: 0,
            isPreview: false,
            courseId,
            moduleId: preselectedModuleId || course?.modules?.[0]?.id || "",
          },
    validators: {
      onChange: lessonId ? updateLessonSchema : createLessonSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading(
        lessonId ? "Updating lesson..." : "Creating lesson...",
      );

      try {
        if (lessonId) {
          await updateLessonMutation.mutateAsync(value as UpdateLessonFormData);
          toast.success("Lesson updated successfully!", { id: toastId });
        } else {
          await createLessonMutation.mutateAsync(value as CreateLessonFormData);
          toast.success("Lesson created successfully!", { id: toastId });
        }

        await queryClient.invalidateQueries({
          queryKey: ["admin", "courses"],
        });
      } catch (error) {
        console.error("Lesson save error", error);
        toast.error("Failed to save lesson. Please try again.", {
          id: toastId,
        });
      }
    },
  });

  async function handleDelete() {
    if (!lessonId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson?",
    );
    if (!confirmed) return;

    const toastId = toast.loading("Deleting lesson...");

    try {
      await deleteLessonMutation.mutateAsync({ lessonId });
      toast.success("Lesson deleted successfully!", { id: toastId });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "courses"],
      });
    } catch (error) {
      console.error("Lesson delete error", error);
      toast.error("Failed to delete lesson. Please try again.", {
        id: toastId,
      });
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {lessonId ? "Edit Lesson" : "Create New Lesson"}
          </h2>
          {lessonId && (
            <button
              className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              onClick={handleDelete}
              type="button"
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              Delete Lesson
            </button>
          )}
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {!lessonId && (
            <form.Field name="moduleId">
              {(field) => (
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    htmlFor="moduleId"
                  >
                    Module
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    id="moduleId"
                    name="moduleId"
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    value={field.state.value}
                  >
                    {course?.modules?.map((module) => (
                      <option
                        key={module.id}
                        value={module.id}
                      >
                        {module.title}
                      </option>
                    ))}
                  </select>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>
          )}

          <form.Field name="title">
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="title"
                >
                  Lesson Title
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  id="title"
                  name="title"
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Getting Started with Components"
                  type="text"
                  value={field.state.value}
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
                  Slug
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  id="slug"
                  name="slug"
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="getting-started-with-components"
                  type="text"
                  value={field.state.value}
                />
                <FieldInfo field={field} />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="videoUrl">
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="videoUrl"
                >
                  Video URL
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  id="videoUrl"
                  name="videoUrl"
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  type="url"
                  value={field.state.value}
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="duration">
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="duration"
                >
                  Duration (seconds)
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  id="duration"
                  name="duration"
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.handleChange(val ? parseInt(val, 10) : null);
                  }}
                  placeholder="300"
                  type="number"
                  value={field.state.value || ""}
                />
                <FieldInfo field={field} />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Video duration in seconds (e.g., 300 for 5 minutes)
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="isPreview">
            {(field) => (
              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  id="isPreview"
                  checked={field.state.value}
                  name="isPreview"
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  type="checkbox"
                />
                <label
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  htmlFor="isPreview"
                >
                  Allow preview (non-enrolled users can watch)
                </label>
              </div>
            )}
          </form.Field>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Content & Notes
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Content and transcription fields are JSON objects. Rich editor
              support coming soon.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              disabled={form.state.isSubmitting}
              type="submit"
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {form.state.isSubmitting
                ? "Saving..."
                : lessonId
                  ? "Update Lesson"
                  : "Create Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
