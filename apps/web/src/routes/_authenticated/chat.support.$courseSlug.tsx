import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CoursesCollection } from "~/collections/courses";
import { SupportTicketsCollection } from "~/collections/support-tickets";
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
import { useCourses } from "~/hooks/use-courses";
import { useSupportTicketsByCourseId } from "~/hooks/use-support-tickets";
import { useAuth } from "~/lib/auth.context";

export const Route = createFileRoute(
  "/_authenticated/chat/support/$courseSlug",
)({
  loader: async () => {
    await Promise.all([
      SupportTicketsCollection.preload(),
      CoursesCollection.preload(),
    ]);
  },
  component: CourseSupportPage,
});

function CourseSupportPage() {
  const auth = useAuth();
  const params = useParams({
    from: "/_authenticated/chat/support/$courseSlug",
  });
  const { courseSlug } = params;

  // Get all courses to find the current one by slug
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const currentCourse = courses?.find((c) => c.slug === courseSlug);
  const courseId = currentCourse?.id ?? "";

  // Get support tickets filtered by courseId
  // When courseId is empty, the query returns an empty array (no matching tickets)
  const { data: tickets, isLoading: ticketsLoading } =
    useSupportTicketsByCourseId({ courseId });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  function handleDeleteClick(ticketId: string, ticketTitle: string) {
    setTicketToDelete({ id: ticketId, title: ticketTitle });
    setDeleteConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (!ticketToDelete) return;

    const toastId = toast.loading(
      `Deleting ticket "${ticketToDelete.title}"...`,
    );

    try {
      SupportTicketsCollection.delete(ticketToDelete.id);

      toast.success("Ticket deleted successfully.", { id: toastId });
    } catch (error) {
      console.error("Error deleting ticket:", error);

      toast.error(
        "An error occurred while deleting the ticket. Please try again.",
        { id: toastId },
      );
    } finally {
      setTicketToDelete(null);
    }
  }

  // Show loading while courses are loading (we need to find the course first)
  if (coursesLoading) {
    return <Loading />;
  }

  // Only after courses have loaded, check if the course exists
  if (!currentCourse) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
          Course Not Found
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          The course you are looking for does not exist.
        </p>
        <Link
          className="mt-4 block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-800"
          to="/chat/$channelId"
          params={{ channelId: "general" }}
        >
          Go back to chat
        </Link>
      </div>
    );
  }

  // Show loading while tickets are loading (now that we have a valid course)
  if (ticketsLoading) {
    return <Loading />;
  }

  const filteredTickets = tickets ?? [];

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            {currentCourse.name} - Support Tickets
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Support tickets for this course. Create a new ticket or view
            existing ones.
          </p>
        </div>

        {auth.session ? (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              className="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-800"
              to="/chat/support/new"
              search={{ courseSlug }}
            >
              Create new ticket
            </Link>
          </div>
        ) : (
          <p className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <TriangleAlertIcon
              size={22}
              color="orange"
            />
            Sign in to create a ticket
          </p>
        )}
      </div>

      {filteredTickets.length !== 0 ? (
        <div className="mt-12 flow-root flex-1 overflow-auto">
          <div className="custom-scrollbar -mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-3 dark:text-white">
                      User
                    </TableHeaderCell>
                    <TableHeaderCell className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-3 dark:text-white">
                      Title
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Module
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Lesson
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Priority
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Comments
                    </TableHeaderCell>
                    <TableHeaderCell className="py-3.5 pr-4 pl-3 sm:pr-3">
                      <span className="sr-only">Actions</span>
                    </TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>

                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableBodyRow key={ticket.id}>
                      <TableBodyCell className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-3 dark:text-white">
                        {ticket.user.image ? (
                          <img
                            className="mr-2 inline-block h-6 w-6 rounded-full object-cover"
                            src={ticket.user.image}
                            alt={ticket.user.name}
                          />
                        ) : null}
                        {ticket.user.name}
                      </TableBodyCell>

                      <TableBodyCell className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-3 dark:text-white">
                        {ticket.title}
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {ticket.module?.order || "N/A"}
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {ticket.lesson?.order || "N/A"}
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {ticket.priority === "low" ? (
                          <span className="inline-flex items-center rounded-md bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-blue-500/50 ring-inset">
                            Low
                          </span>
                        ) : ticket.priority === "medium" ? (
                          <span className="inline-flex items-center rounded-md bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-yellow-500/50 ring-inset">
                            Medium
                          </span>
                        ) : ticket.priority === "high" ? (
                          <span className="inline-flex items-center rounded-md bg-red-900/30 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-red-500/50 ring-inset">
                            High
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-purple-500/50 ring-inset">
                            Urgent
                          </span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {ticket.status === "open" ? (
                          <span className="inline-flex items-center rounded-md bg-green-900/30 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/50 ring-inset">
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-red-900/30 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-red-500/50 ring-inset">
                            Closed
                          </span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-900 dark:text-white">
                          {ticket.comments.length}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-3">
                        {auth.hasRole("admin") ||
                        auth.session?.user.id === ticket.userId ? (
                          <div className="flex justify-end gap-4">
                            <button
                              className="cursor-pointer text-red-400 no-underline hover:text-red-300 hover:underline"
                              onClick={() =>
                                handleDeleteClick(ticket.id, ticket.title)
                              }
                            >
                              Delete
                              <span className="sr-only">, {ticket.title}</span>
                            </button>
                            <Link
                              className="text-blue-400 no-underline hover:text-blue-300 hover:underline"
                              to="/support/$supportTicket/edit"
                              params={{ supportTicket: ticket.id }}
                            >
                              Edit
                              <span className="sr-only">, {ticket.title}</span>
                            </Link>
                            <Link
                              className="text-green-400 no-underline hover:text-green-300 hover:underline"
                              to="/support/$supportTicket"
                              params={{ supportTicket: ticket.id }}
                            >
                              View
                              <span className="sr-only">, {ticket.title}</span>
                            </Link>
                          </div>
                        ) : (
                          <Link
                            className="text-green-400 no-underline hover:text-green-300 hover:underline"
                            to="/support/$supportTicket"
                            params={{ supportTicket: ticket.id }}
                          >
                            View
                            <span className="sr-only">, {ticket.title}</span>
                          </Link>
                        )}
                      </TableBodyCell>
                    </TableBodyRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-12 flex-1">
          <EmptyState title="No support tickets for this course yet." />
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Ticket"
        description={`Are you sure you want to delete the ticket titled "${ticketToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
