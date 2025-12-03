import { Link, createFileRoute } from "@tanstack/react-router";
import { TriangleAlertIcon } from "lucide-react";
import Loading from "~/components/loading";
import { useAuth } from "~/lib/auth.context";
import {
  SupportTicketsCollection,
  useSupportTickets,
} from "~/lib/db.collections";

export const Route = createFileRoute("/support/")({
  loader: async () => {
    await SupportTicketsCollection.preload();
  },
  component: SupportIndexPage,
});

function SupportIndexPage() {
  const auth = useAuth();
  const { data: tickets, isLoading } = useSupportTickets();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="mt-20 mb-20 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-white md:text-3xl">
            Support Tickets
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Welcome to the support ticket system. Here you can view all support
            tickets submitted by users.
          </p>
        </div>
        {auth.session ? (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-700"
              to="/support/create-ticket"
            >
              Create new ticket
            </Link>
          </div>
        ) : (
          <p className="mt-4 flex items-center gap-2 text-sm text-gray-300">
            <TriangleAlertIcon
              size={22}
              color="orange"
            />
            Sign in to create a ticket
          </p>
        )}
      </div>
      {tickets.length !== 0 ? (
        <div className="mt-12 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="relative min-w-full divide-y divide-white/15">
                <thead>
                  <tr className="bg-gray-700/50">
                    <th
                      className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-white sm:pl-3"
                      scope="col"
                    >
                      User
                    </th>
                    <th
                      className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-white sm:pl-3"
                      scope="col"
                    >
                      Title
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      scope="col"
                    >
                      Module
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      scope="col"
                    >
                      Lesson
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      scope="col"
                    >
                      Priority
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      scope="col"
                    >
                      Status
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      scope="col"
                    >
                      Comments
                    </th>
                    <th
                      className="py-3.5 pr-4 pl-3 sm:pr-3"
                      scope="col"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900">
                  {tickets.map((ticket) => (
                    <tr
                      className="even:bg-gray-800/50"
                      key={ticket.id}
                    >
                      <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-3">
                        {ticket.user.image ? (
                          <img
                            className="mr-2 inline-block h-6 w-6 rounded-full object-cover"
                            src={ticket.user.image}
                            alt={ticket.user.name}
                          />
                        ) : null}
                        {ticket.user.name}
                      </td>
                      <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-3">
                        {ticket.title}
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        {ticket.module?.order || "N/A"}
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        {ticket.lesson?.order || "N/A"}
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
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
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        {ticket.status === "open" ? (
                          <span className="inline-flex items-center rounded-md bg-green-900/30 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/50 ring-inset">
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-red-900/30 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-red-500/50 ring-inset">
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white">
                          {ticket.comments.length}
                        </span>
                      </td>
                      <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-3">
                        {auth.hasRole("admin") ||
                        auth.session?.user.id === ticket.userId ? (
                          <div className="flex justify-end gap-4">
                            <Link
                              className="text-green-600 no-underline hover:text-green-500 hover:underline"
                              to="/support/$supportTicket/edit"
                              params={{ supportTicket: ticket.id }}
                            >
                              Edit
                              <span className="sr-only">, {ticket.title}</span>
                            </Link>
                            <Link
                              className="text-green-600 no-underline hover:text-green-500 hover:underline"
                              to="/support/$supportTicket"
                              params={{ supportTicket: ticket.id }}
                            >
                              View
                              <span className="sr-only">, {ticket.title}</span>
                            </Link>
                          </div>
                        ) : (
                          <Link
                            className="text-green-600 no-underline hover:text-green-500 hover:underline"
                            to="/support/$supportTicket"
                            params={{ supportTicket: ticket.id }}
                          >
                            View
                            <span className="sr-only">, {ticket.title}</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-20 flex justify-center">
          <p className="text-md text-gray-300">
            No support tickets created yet.
          </p>
        </div>
      )}
    </div>
  );
}
