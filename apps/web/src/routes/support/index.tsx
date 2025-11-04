import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import Loading from "~/components/loading";
import { useAuth } from "~/lib/auth.context.ts";
import { trpc } from "~/lib/trpc.client";

export const Route = createFileRoute("/support/")({
  loader: async ({ context }) => {
    const { queryClient } = context;

    queryClient.ensureQueryData(
      trpc.supportTickets.getAllSupportTickets.queryOptions(),
    );
  },
  component: SupportIndexPage,
});

function SupportIndexPage() {
  const auth = useAuth();
  const { data: tickets, isLoading } = useSuspenseQuery(
    trpc.supportTickets.getAllSupportTickets.queryOptions(),
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="mt-20 px-4 sm:px-6 lg:px-8">
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
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            className="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
            to="/support/create-ticket"
          >
            Create new ticket
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="relative min-w-full divide-y divide-white/15">
              <thead>
                <tr>
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
                    className="py-3.5 pr-4 pl-3 sm:pr-3"
                    scope="col"
                  >
                    <span className="sr-only">Edit</span>
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
                      {ticket.title}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                      {ticket.lessonId}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                      {ticket.priority}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                      {ticket.status}
                    </td>
                    <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-3">
                      {auth.hasRole("admin") ? (
                        <div className="flex justify-end gap-4">
                          <Link
                            className="text-green-600 hover:text-green-500"
                            to="/support/$supportTicket/edit"
                            params={{ supportTicket: ticket.id }}
                          >
                            Edit
                            <span className="sr-only">, {ticket.title}</span>
                          </Link>
                          <Link
                            className="text-green-600 hover:text-green-500"
                            to="/support/$supportTicket"
                            params={{ supportTicket: ticket.id }}
                          >
                            View
                            <span className="sr-only">, {ticket.title}</span>
                          </Link>
                        </div>
                      ) : (
                        <Link
                          className="text-green-600 hover:text-green-500"
                          to="/support/$supportTicket/edit"
                          params={{ supportTicket: ticket.id }}
                        >
                          View<span className="sr-only">, {ticket.title}</span>
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
    </div>
  );
}
