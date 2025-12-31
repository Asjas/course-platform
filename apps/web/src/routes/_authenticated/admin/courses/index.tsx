import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "~/components/confirm-dialog";
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
  type AdminCourseDetail,
  CoursesAdminCollection,
  useCoursesAdmin,
} from "~/lib/db.collections";
import { queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/courses/")({
  loader: async () => {
    await CoursesAdminCollection.preload();
  },
  component: AdminCoursesPage,
});

function AdminCoursesPage() {
  const { data: courses, isLoading } = useCoursesAdmin();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] =
    useState<AdminCourseDetail | null>(null);

  const deleteCourseMutation = useMutation(
    trpc.courses.deleteCourse.mutationOptions(),
  );

  function handleDeleteClick(course: AdminCourseDetail) {
    setCourseToDelete(course);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!courseToDelete) return;

    const toastId = toast.loading(`Deleting course ${courseToDelete.name}...`);

    try {
      await deleteCourseMutation.mutateAsync({ courseId: courseToDelete.id });

      queryClient.invalidateQueries({
        queryKey: ["admin", "courses"],
      });

      toast.success(`Course ${courseToDelete.name} deleted successfully.`, {
        id: toastId,
      });
    } catch (error) {
      console.error("Error deleting course:", error);

      toast.error(
        `An error occurred while deleting the course ${courseToDelete.name}. Please try again.`,
        { id: toastId },
      );
    } finally {
      setCourseToDelete(null);
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-full flex-col">
      <header className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Courses
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage courses, modules, and lessons. Create, edit, and organize
            your course content.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 sm:ml-16">
          <Link
            className="inline-flex cursor-pointer items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 active:bg-green-800"
            to="/admin/courses/create"
          >
            <PlusIcon
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            />
            Create New Course
          </Link>
        </div>
      </header>

      {courses.length > 0 ? (
        <section
          className="mt-12 flow-root"
          aria-labelledby="courses-table-heading"
        >
          <h2
            className="sr-only"
            id="courses-table-heading"
          >
            Courses list
          </h2>
          <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table aria-label="Courses with name, slug, price, modules, lessons, status, and actions">
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Slug</TableHeaderCell>
                    <TableHeaderCell>Price</TableHeaderCell>
                    <TableHeaderCell>Modules</TableHeaderCell>
                    <TableHeaderCell>Lessons</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>
                      <span className="sr-only">Table Actions</span>
                    </TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>

                <TableBody>
                  {courses.map((course) => (
                    <TableBodyRow key={course.id}>
                      <TableBodyCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-gray-900 dark:text-white">
                            {course.name}
                          </span>
                          {course.description && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {course.description.substring(0, 60)}
                              {course.description.length > 60 ? "..." : ""}
                            </span>
                          )}
                        </div>
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        <code className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-800 dark:bg-gray-600/75 dark:text-white">
                          {course.slug}
                        </code>
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {course.isFree ? (
                          <span className="text-green-600 dark:text-green-400">
                            Free
                          </span>
                        ) : (
                          <span>
                            ${course.price}
                            {course.isSaleActive && course.salePrice > 0 && (
                              <span className="ml-1 text-sm text-red-600 dark:text-red-400">
                                (Sale: ${course.salePrice})
                              </span>
                            )}
                          </span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {course.modules?.length || 0}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {course.lessons?.length || 0}
                      </TableBodyCell>

                      <TableBodyCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
                            course.published
                              ? "bg-green-100 text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 ring-1 ring-gray-500/50 ring-inset dark:bg-gray-900/30 dark:text-gray-400",
                          )}
                        >
                          {course.published ? "Published" : "Draft"}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell>
                        <div className="flex justify-around gap-2">
                          <Link
                            className="cursor-pointer text-blue-400 hover:text-blue-300"
                            to="/admin/courses/$courseId/edit"
                            params={{ courseId: course.id }}
                          >
                            <PencilIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">Edit {course.name}</span>
                          </Link>
                          <button
                            className="cursor-pointer text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteClick(course)}
                          >
                            <Trash2Icon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">
                              Delete {course.name}
                            </span>
                          </button>
                        </div>
                      </TableBodyCell>
                    </TableBodyRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title="No courses found"
          description="Get started by creating a new course."
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        description={`Are you sure you want to delete "${courseToDelete?.name}"? This will also delete all modules and lessons. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
