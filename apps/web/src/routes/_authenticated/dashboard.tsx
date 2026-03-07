import { useQueries, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { AnnouncementsBanner } from "~/components/announcements/AnnouncementsBanner";
import { CourseCard } from "~/components/course-card";
import { EmptyState } from "~/components/empty-state";
import { getBackendErrorMessage } from "~/lib/api-error";
import { useAuth } from "~/lib/auth.context";
import { CoursesCollection, useCourses } from "~/lib/db.collections";
import { trpc } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: z.object({
    accessDenied: z.enum(["admin"]).optional(),
  }),
  component: AuthenticatedDashboardPage,
  loader: async () => {
    await CoursesCollection.preload();
  },
});

function AuthenticatedDashboardPage() {
  const { data: courses, isLoading } = useCourses();
  const { session } = useAuth();
  const search = Route.useSearch();
  const isAdmin = session?.user?.role === "admin";

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
  const ticketCountsQuery = useQuery({
    ...trpc.supportTickets.getSupportTicketCountsByCourse.queryOptions(),
    enabled: isAdmin,
  });
  const ticketCounts =
    (ticketCountsQuery.data as Record<string, number> | undefined) ?? {};
  const ticketCountError = ticketCountsQuery.error;

  useEffect(() => {
    if (search.accessDenied === "admin") {
      toast.error("Access denied. Admin privileges are required.", {
        id: "admin-access-denied",
      });
    }
  }, [search.accessDenied]);

  useEffect(() => {
    if (!ticketCountError) {
      return;
    }

    toast.error(
      getBackendErrorMessage(
        ticketCountError,
        "Failed to load support ticket counts.",
      ),
      {
        id: "ticket-count-error",
      },
    );
  }, [ticketCountError]);

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
            const supportTicketCount = ticketCounts?.[course.id];

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
        <EmptyState
          title="No courses available yet."
          description="Courses will appear here once you enroll."
        />
      )}
    </div>
  );
}
