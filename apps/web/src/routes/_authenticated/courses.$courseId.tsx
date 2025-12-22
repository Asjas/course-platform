import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, Clock, Play } from "lucide-react";
import { CoursesCollection, useCourseById } from "~/lib/db.collections";
import { trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  component: CourseDetailPage,
  loader: async ({ params }) => {
    await CoursesCollection.preload();
    // If the course with full details isn't in collection, fetch it
    const courseInCollection = CoursesCollection.findOne(params.courseId);
    if (!courseInCollection?.modules) {
      const fullCourse = await trpcClient.courses.getById.query({
        courseId: params.courseId,
      });
      // Update the collection with full course details
      if (fullCourse) {
        CoursesCollection.upsert(fullCourse);
      }
    }
  },
});

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const { data: course, isLoading } = useCourseById({ courseId });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p>Course not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
          Back to Courses
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              {course.name}
            </h1>

            {course.description && (
              <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                {course.description}
              </p>
            )}

            <div className="mb-8 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <BookOpen className="h-5 w-5" />
                <span>
                  {course.totalLessons}{" "}
                  {course.totalLessons === 1 ? "lesson" : "lessons"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-5 w-5" />
                <span>{formatDuration(course.totalDuration)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Course Content
              </h2>

              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules
                    .sort((a, b) => a.order - b.order)
                    .map((module) => (
                      <div
                        key={module.id}
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="bg-gray-50 p-4 dark:bg-gray-900">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {module.title}
                          </h3>
                          {module.description && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {module.description}
                            </p>
                          )}
                        </div>

                        {module.lessons && module.lessons.length > 0 && (
                          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {module.lessons
                              .sort((a, b) => a.order - b.order)
                              .map((lesson) => (
                                <li key={lesson.id}>
                                  <Link
                                    to="/courses/$courseId/lessons/$lessonId"
                                    params={{
                                      courseId: course.id,
                                      lessonId: lesson.id,
                                    }}
                                    className="flex items-center gap-3 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                                  >
                                    <Play className="h-5 w-5 shrink-0 text-green-600" />
                                    <span className="grow text-gray-900 dark:text-white">
                                      {lesson.title}
                                    </span>
                                    {lesson.duration && (
                                      <span className="shrink-0 text-sm text-gray-600 dark:text-gray-400">
                                        {formatDuration(lesson.duration)}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No modules available yet.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            {course.thumbnailUrl && (
              <div className="mb-4 overflow-hidden rounded-lg">
                <img
                  src={course.thumbnailUrl}
                  alt={course.name}
                  className="h-auto w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
