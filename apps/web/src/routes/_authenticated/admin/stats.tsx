import { createFileRoute } from "@tanstack/react-router";
import { Activity, BookOpen, TrendingUp, Users } from "lucide-react";
import { trpcClient } from "~/lib/trpc.client.js";

export const Route = createFileRoute("/_authenticated/admin/stats")({
  loader: async () => {
    const [platformStats, courseStats] = await Promise.all([
      trpcClient.stats.getPlatformStats.query(),
      trpcClient.stats.getCourseStats.query(),
    ]);

    return { platformStats, courseStats };
  },
  component: StatsPage,
});

function StatsPage() {
  const { platformStats, courseStats } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Platform Statistics
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of course enrollments and platform activity
        </p>
      </div>

      {/* Platform Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Courses
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {platformStats.totalCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Enrollments
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {platformStats.totalEnrollments}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Enrollments
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {platformStats.activeEnrollments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Statistics Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Course Statistics
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Course Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Modules
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Lessons
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Total Enrollments
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Active
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Completed
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {courseStats.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No courses found
                  </td>
                </tr>
              ) : (
                courseStats.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    <th
                      scope="row"
                      className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                    >
                      {course.name}
                    </th>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          course.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      ${course.price}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                      {course.modulesCount}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                      {course.lessonsCount}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">
                      {course.totalEnrollments}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                      {course.activeEnrollments}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                      {course.completedEnrollments}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {course.completionRate}%
                        </span>
                        {course.completionRate > 0 && (
                          <TrendingUp
                            className={`h-4 w-4 ${
                              course.completionRate >= 50
                                ? "text-green-600"
                                : course.completionRate >= 25
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
