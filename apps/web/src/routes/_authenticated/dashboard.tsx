import { createFileRoute } from "@tanstack/react-router";
import { CourseCard } from "~/components/course-card";
import { CoursesCollection, useCourses } from "~/lib/db.collections";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: AuthenticatedDashboardPage,
  loader: async () => {
    await CoursesCollection.preload();
  },
});

function AuthenticatedDashboardPage() {
  const { data: courses, isLoading } = useCourses();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Courses
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Courses
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Continue learning where you left off
        </p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              id={course.id}
              key={course.id}
              name={course.name}
              description={course.description}
              thumbnailUrl={course.thumbnailUrl}
              totalLessons={course.totalLessons}
              totalDuration={course.totalDuration}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            No courses available yet.
          </p>
        </div>
      )}
    </div>
  );
}
