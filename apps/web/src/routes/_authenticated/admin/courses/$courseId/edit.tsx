import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import CourseEditorSidebar from "~/components/course-editor-sidebar";
import Loading from "~/components/loading";
import { trpc, trpcClient } from "~/lib/trpc.client";

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
            modules={modules}
            lessons={lessons}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
            onModulesReordered={() => {
              // Optimistic update handled in sidebar
            }}
          />
        </div>

        {/* Content Editor */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8 dark:bg-gray-900">
          {selectedItemId && selectedItemType === "module" ? (
            <ModuleEditor
              moduleId={selectedItemId === "new-module" ? null : selectedItemId}
            />
          ) : selectedItemId && selectedItemType === "lesson" ? (
            <LessonEditor
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
}

function ModuleEditor({ moduleId }: ModuleEditorProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          {moduleId ? "Edit Module" : "Create New Module"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Module editor coming soon... (Module ID: {moduleId || "new"})
        </p>
      </div>
    </div>
  );
}

interface LessonEditorProps {
  lessonId: string | null;
}

function LessonEditor({ lessonId }: LessonEditorProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          {lessonId ? "Edit Lesson" : "Create New Lesson"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Lesson editor coming soon... (Lesson ID: {lessonId || "new"})
        </p>
      </div>
    </div>
  );
}
