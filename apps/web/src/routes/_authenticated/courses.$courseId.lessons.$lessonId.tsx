import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Clock,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState } from "react";
import { CoursesCollection, useCourseById } from "~/lib/db.collections";
import { trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute(
  "/_authenticated/courses/$courseId/lessons/$lessonId",
)({
  component: LessonPage,
  loader: async ({ params }) => {
    await CoursesCollection.preload();
    // Ensure we have the full course with modules and lessons
    const courseInCollection = CoursesCollection.findOne(params.courseId);
    if (!courseInCollection?.modules) {
      const fullCourse = await trpcClient.courses.getById.query({
        courseId: params.courseId,
      });
      if (fullCourse) {
        CoursesCollection.upsert(fullCourse);
      }
    }
  },
});

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function LessonPage() {
  const { courseId, lessonId } = Route.useParams();
  const [layoutMode, setLayoutMode] = useState<"sidebar" | "fullscreen">(
    "sidebar",
  );

  const { data: course, isLoading } = useCourseById({ courseId });

  if (isLoading || !course) {
    return (
      <div className="p-8">
        <p>Loading lesson...</p>
      </div>
    );
  }

  // Find the lesson in the course modules
  let lesson = null;
  for (const module of course.modules || []) {
    const found = module.lessons?.find((l) => l.id === lessonId);
    if (found) {
      lesson = found;
      break;
    }
  }

  if (!lesson) {
    return (
      <div className="p-8">
        <p>Lesson not found</p>
      </div>
    );
  }

  const sortedModules = course.modules
    ? course.modules.sort((a, b) => a.order - b.order)
    : [];

  const toggleLayout = () => {
    setLayoutMode((prev) => (prev === "sidebar" ? "fullscreen" : "sidebar"));
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <Link
            to="/courses/$courseId"
            params={{ courseId }}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
            Back to Course
          </Link>

          <button
            onClick={toggleLayout}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            aria-label={
              layoutMode === "sidebar"
                ? "Switch to fullscreen mode"
                : "Switch to sidebar mode"
            }
          >
            {layoutMode === "sidebar" ? (
              <>
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            ) : (
              <>
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grow overflow-hidden">
        {layoutMode === "sidebar" ? (
          <div className="grid h-full lg:grid-cols-[1fr_400px]">
            {/* Video Player */}
            <div className="flex flex-col overflow-y-auto bg-black">
              <div className="aspect-video w-full bg-gray-900">
                {lesson.videoProvider === "youtube" && lesson.videoUrl && (
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${lesson.videoUrl}`}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>

            {/* Lesson Playlist */}
            <div className="flex flex-col overflow-hidden border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Course Content
                </h2>
              </div>

              <div className="grow overflow-y-auto">
                {sortedModules.map((module) => (
                  <div key={module.id} className="border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 p-3 dark:bg-gray-900">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {module.title}
                      </h3>
                    </div>

                    {module.lessons && module.lessons.length > 0 && (
                      <ul>
                        {module.lessons
                          .sort((a, b) => a.order - b.order)
                          .map((moduleLesson) => {
                            const isActive = moduleLesson.id === lessonId;
                            return (
                              <li key={moduleLesson.id}>
                                <Link
                                  to="/courses/$courseId/lessons/$lessonId"
                                  params={{
                                    courseId,
                                    lessonId: moduleLesson.id,
                                  }}
                                  className={`flex items-center gap-3 border-l-4 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
                                    isActive
                                      ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                                      : "border-transparent"
                                  }`}
                                >
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600">
                                    <Check className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                                  </div>
                                  <span
                                    className={`grow text-sm ${
                                      isActive
                                        ? "font-semibold text-gray-900 dark:text-white"
                                        : "text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {moduleLesson.title}
                                  </span>
                                  {moduleLesson.duration && (
                                    <span className="flex shrink-0 items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                      <Clock className="h-3 w-3" />
                                      {formatDuration(moduleLesson.duration)}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col overflow-y-auto">
            {/* Fullscreen Video Player */}
            <div className="w-full bg-black">
              <div className="aspect-video w-full bg-gray-900">
                {lesson.videoProvider === "youtube" && lesson.videoUrl && (
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${lesson.videoUrl}`}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>

            {/* Notes and Playlist Side by Side */}
            <div className="grid grow gap-6 overflow-y-auto bg-white p-6 dark:bg-gray-800 md:grid-cols-2">
              {/* Notes Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lesson.title}
                </h2>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {lesson.content && typeof lesson.content === "object" && (
                    <div className="text-gray-700 dark:text-gray-300">
                      {/* Content would be rendered here with proper JSON handling */}
                      <p>Lesson notes and content...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Playlist Section */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Course Content
                  </h3>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                  {sortedModules.map((module) => (
                    <div key={module.id} className="border-b border-gray-200 dark:border-gray-700">
                      <div className="bg-gray-50 p-3 dark:bg-gray-900">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {module.title}
                        </h4>
                      </div>

                      {module.lessons && module.lessons.length > 0 && (
                        <ul>
                          {module.lessons
                            .sort((a, b) => a.order - b.order)
                            .map((moduleLesson) => {
                              const isActive = moduleLesson.id === lessonId;
                              return (
                                <li key={moduleLesson.id}>
                                  <Link
                                    to="/courses/$courseId/lessons/$lessonId"
                                    params={{
                                      courseId,
                                      lessonId: moduleLesson.id,
                                    }}
                                    className={`flex items-center gap-3 border-l-4 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
                                      isActive
                                        ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                                        : "border-transparent"
                                    }`}
                                  >
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600">
                                      <Check className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <span
                                      className={`grow text-sm ${
                                        isActive
                                          ? "font-semibold text-gray-900 dark:text-white"
                                          : "text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {moduleLesson.title}
                                    </span>
                                    {moduleLesson.duration && (
                                      <span className="flex shrink-0 items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(moduleLesson.duration)}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              );
                            })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
