import { createFileRoute } from "@tanstack/react-router";
import { intlFormat } from "date-fns";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { EmptyState } from "~/components/empty-state";
import Loading from "~/components/loading";
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
} from "~/components/ui/table";
import {
  CourseProgressAdminCollection,
  useCourseProgressAdmin,
} from "~/lib/db.collections";

export const Route = createFileRoute("/_authenticated/admin/progress")({
  loader: async () => {
    await CourseProgressAdminCollection.preload();
  },
  component: AdminProgressPage,
});

function AdminProgressPage() {
  const { data: progressItems, isLoading } = useCourseProgressAdmin();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Course Progress
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Monitor learner progress across all courses on the platform.
          </p>
        </div>
      </div>

      {progressItems.length > 0 ? (
        <div className="mt-12 flow-root">
          <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table aria-label="Course progress with user, course, progress percentage, completed status, started at, and last accessed at">
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Course</TableHeaderCell>
                    <TableHeaderCell>Progress</TableHeaderCell>
                    <TableHeaderCell>Completed</TableHeaderCell>
                    <TableHeaderCell>Started At</TableHeaderCell>
                    <TableHeaderCell>Last Accessed At</TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>

                <TableBody>
                  {progressItems.map((item) => {
                    const progressPct = Math.round(item.progress ?? 0);

                    return (
                      <TableBodyRow key={item.id}>
                        <TableBodyCell>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.user?.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.user?.email}
                            </p>
                          </div>
                        </TableBodyCell>

                        <TableBodyCell className="text-gray-600 dark:text-gray-300">
                          {item.course?.name || "Unknown Course"}
                        </TableBodyCell>

                        <TableBodyCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                              role="progressbar"
                              aria-valuenow={progressPct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${progressPct}% complete`}
                            >
                              <div
                                className="h-full rounded-full bg-green-500"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {progressPct}%
                            </span>
                          </div>
                        </TableBodyCell>

                        <TableBodyCell>
                          {item.completedAt ? (
                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle2Icon
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              <span className="text-xs">Yes</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-400">
                              <XCircleIcon
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              <span className="text-xs">No</span>
                            </span>
                          )}
                        </TableBodyCell>

                        <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                          {item.startedAt ? (
                            intlFormat(new Date(item.startedAt), {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableBodyCell>

                        <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                          {item.lastAccessedAt ? (
                            intlFormat(new Date(item.lastAccessedAt), {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableBodyCell>
                      </TableBodyRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No progress data"
          description="There is no course progress data to display yet."
        />
      )}
    </div>
  );
}
