import { intlFormat } from "date-fns";
import { useState } from "react";
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
import { useEnrollmentsAdmin } from "~/hooks/use-enrollments";
import { cn } from "~/lib/utils";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className:
      "bg-green-100 text-green-700 ring-green-500/50 dark:bg-green-900/30 dark:text-green-400",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-100 text-red-700 ring-red-500/50 dark:bg-red-900/30 dark:text-red-400",
  },
  refunded: {
    label: "Refunded",
    className:
      "bg-orange-100 text-orange-700 ring-orange-500/50 dark:bg-orange-900/30 dark:text-orange-400",
  },
  completed: {
    label: "Completed",
    className:
      "bg-blue-100 text-blue-700 ring-blue-500/50 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

export function AdminEnrollmentsPage() {
  const { data: enrollments, isLoading } = useEnrollmentsAdmin();
  const [search, setSearch] = useState("");

  const filtered = enrollments.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.user?.name?.toLowerCase().includes(q) ||
      e.user?.email?.toLowerCase().includes(q) ||
      e.course?.name?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Enrollments
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            View all course enrollments across the platform.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label
          className="sr-only"
          htmlFor="enrollment-search"
        >
          Search enrollments
        </label>
        <input
          className="w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
          id="enrollment-search"
          type="search"
          placeholder="Search by user or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="mt-6 flow-root">
          <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table aria-label="Course enrollments with user, course, type, source, status, and enrolled at">
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Course</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Source</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Enrolled At</TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((enrollment) => {
                    const statusStyle =
                      STATUS_STYLES[enrollment.status] ?? STATUS_STYLES.active;

                    return (
                      <TableBodyRow key={enrollment.id}>
                        <TableBodyCell>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {enrollment.user?.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {enrollment.user?.email}
                            </p>
                          </div>
                        </TableBodyCell>

                        <TableBodyCell className="text-gray-600 dark:text-gray-300">
                          {enrollment.course?.name || "Unknown Course"}
                        </TableBodyCell>

                        <TableBodyCell className="text-gray-600 capitalize dark:text-gray-300">
                          {enrollment.enrollmentType}
                        </TableBodyCell>

                        <TableBodyCell className="text-gray-600 capitalize dark:text-gray-300">
                          {enrollment.enrollmentSource}
                        </TableBodyCell>

                        <TableBodyCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                              statusStyle.className,
                            )}
                          >
                            {statusStyle.label}
                          </span>
                        </TableBodyCell>

                        <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                          {intlFormat(new Date(enrollment.enrolledAt), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
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
          title="No enrollments found"
          description={
            search
              ? "No enrollments match your search."
              : "There are no enrollments yet."
          }
        />
      )}
    </div>
  );
}
