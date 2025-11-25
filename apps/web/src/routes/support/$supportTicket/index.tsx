import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import {
  CheckIcon,
  CircleDotIcon,
  CopyIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SupportCommentForm from "~/components/forms/create-support-comment-form";
import Loading from "~/components/loading";
import SupportComment from "~/components/support-comment";
import { useAuth } from "~/lib/auth.context";
import { useSupportTicketById } from "~/lib/db.collections";
import { queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/support/$supportTicket/")({
  loader: async ({ context, params }) => {
    const { queryClient } = context;

    queryClient.ensureQueryData(
      trpc.supportTickets.getSupportTicketById.queryOptions({
        ticketId: params.supportTicket,
      }),
    );
  },
  component: SupportTicketIndexPage,
});

function SupportTicketIndexPage() {
  const params = useParams({ from: "/support/$supportTicket/" });
  const auth = useAuth();

  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: ticket, isLoading } = useSupportTicketById({
    ticketId: params.supportTicket,
  });

  console.log("Loading state:", isLoading);

  if (isLoading) {
    return <Loading />;
  }

  console.log("Ticket data:", ticket);

  if (!ticket) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-lg font-semibold text-white md:text-3xl">
          Ticket Not Found
        </h1>
        <p className="mt-2 text-sm text-gray-300">
          The support ticket you are looking for does not exist.
        </p>
        <Link
          className="mt-4 block rounded-md bg-green-700 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-700"
          to="/support"
        >
          Go back to all tickets
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto mt-20 mb-20 w-full max-w-7xl px-8 md:mt-10">
      <div className="mt-4 flex justify-end gap-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          className="block cursor-pointer rounded-md bg-gray-600 px-2 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
          onClick={() => {
            queryClient.invalidateQueries({
              queryKey: trpc.supportTickets.getSupportTicketById.queryKey({
                ticketId: ticket.id,
              }),
            });

            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 1000);
          }}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        <Link
          className="inline-flex items-center rounded-md bg-green-600 px-2 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
          to="/support"
        >
          Back to all tickets
        </Link>
        {copied ? (
          <button
            className="block rounded-md px-2 py-2 text-center text-sm font-semibold text-white hover:cursor-pointer hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            title="Copied"
          >
            <CheckIcon
              size={18}
              color="green"
            />
          </button>
        ) : (
          <button
            className="block rounded-md px-2 py-2 text-center text-sm font-semibold text-white hover:cursor-pointer hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            title="Copy link"
            onClick={() => {
              const ticketUrl = `${window.location.origin}/support/${ticket.id}`;
              navigator.clipboard.writeText(ticketUrl);
              toast.success("Ticket link copied to clipboard");

              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <CopyIcon size={18} />
          </button>
        )}
      </div>

      {/* Ticket status */}
      <div className="mt-4 flex flex-col gap-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-lg font-semibold text-white md:text-3xl">
              {ticket.title}
            </h1>
            <p className="mt-2 text-[16px] text-gray-400">#{ticket.id}</p>
            <div className="mt-4 flex items-center gap-2 border-b border-gray-600 pb-4 text-white">
              <div
                className={cn(
                  "flex items-center rounded-2xl px-2.5 py-1.5",
                  ticket.status === "open" ? "bg-green-700" : "bg-red-700",
                )}
              >
                <CircleDotIcon size={20} />
                {ticket.status === "open" ? (
                  <span className="ml-2 text-sm font-medium">Open</span>
                ) : (
                  <span className="ml-2 text-sm font-medium">Closed</span>
                )}
              </div>
              <p className="text-sm font-[300] text-gray-200">
                <span className="font-semibold">{ticket.user.name}</span> opened
                this ticket{" "}
                {formatRelative(new Date(ticket.createdAt), new Date())}
                <span> · </span>
                <span>{ticket.comments.length} comments</span>
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Description */}
        <SupportComment
          ticket={ticket}
          content={ticket.description}
          date={ticket.createdAt}
        />

        {/* Comments go here */}
        {ticket.comments.length > 0 ? (
          <div className="flex flex-col gap-8">
            {ticket.comments.map((comment) => (
              <SupportComment
                key={comment.id}
                ticket={ticket}
                content={comment.comment}
                date={comment.createdAt}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p>No comments yet.</p>
          </div>
        )}

        {/* Comment box goes here */}
        {auth.session ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2">
              {auth.session.user.image ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={auth.session.user.image}
                  alt={auth.session.user.name}
                />
              ) : null}
              <h2>Add a comment</h2>
            </div>
            <SupportCommentForm ticketId={ticket.id} />
          </div>
        ) : (
          <div className="mt-10 flex w-full flex-col items-center">
            <p className="mt-4 flex items-center gap-2 text-sm text-gray-300">
              <TriangleAlertIcon
                size={22}
                color="orange"
              />
              Sign in to add a comment.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
