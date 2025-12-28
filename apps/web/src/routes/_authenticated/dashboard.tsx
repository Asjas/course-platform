import { useQueries, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementsBanner } from "~/components/announcements/AnnouncementsBanner";
import { CourseCard } from "~/components/course-card";
import { useAuth } from "~/lib/auth.context";
import { CoursesCollection, useCourses } from "~/lib/db.collections";
import { trpc } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: AuthenticatedDashboardPage,
  loader: async () => {
    await CoursesCollection.preload();
  },
});

function AuthenticatedDashboardPage() {
  const { data: courses, isLoading } = useCourses();
  const { session } = useAuth();

  // Fetch progress for all courses
  const courseIds = courses?.map((course) => course.id) ?? [];
  const progressQueries = useQueries({
    queries: courseIds.map((courseId) =>
      trpc.courses.getCourseProgress.queryOptions({ courseId }),
    ),
  });

  // Create a map of courseId to progress for safer data association
  const progressMap = new Map(
    courseIds.map((courseId, index) => {
      const progressData = progressQueries[index]?.data;
      return [courseId, progressData?.progress ?? 0];
    }),
  );

  // Fetch support ticket counts
  const { data: ticketCounts } = useQuery(
    trpc.supportTickets.getSupportTicketCountsByCourse.queryOptions(),
  );

  if (isLoading) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            My Courses
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {session?.user?.id && <AnnouncementsBanner userId={session.user.id} />}

      <div className="mb-8">
        <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
          My Courses
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Continue learning where you left off
        </p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const progress = progressMap.get(course.id) ?? 0;
            const supportTicketCount = (
              ticketCounts as Record<string, number> | undefined
            )?.[course.id];

            return (
              <CourseCard
                id={course.id}
                key={course.id}
                name={course.name}
                description={course.description}
                thumbnailUrl={course.thumbnailUrl}
                totalModules={course.totalModules}
                totalLessons={course.totalLessons}
                totalDuration={course.totalDuration}
                totalEnrollments={course.totalEnrollments}
                progress={progress}
                supportTicketCount={supportTicketCount}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-12 flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No courses available yet.
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Courses will appear here once you enroll.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
