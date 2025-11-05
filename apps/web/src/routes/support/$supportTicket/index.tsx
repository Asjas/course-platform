import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { formatDistance, formatRelative } from "date-fns";
import { CheckIcon, CircleDotIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loading from "~/components/loading";
import { renderMarkdown } from "~/lib/markdown";
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

  const [ticketContent, setTicketContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: ticket, isLoading } = useSuspenseQuery(
    trpc.supportTickets.getSupportTicketById.queryOptions({
      ticketId: params.supportTicket,
    }),
  );

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const html = await renderMarkdown(ticket?.description);

      if (isMounted) {
        setTicketContent(html);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [ticket]);

  if (isLoading) {
    return <Loading />;
  }

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
          className="mt-4 block rounded-md bg-green-700 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
          to="/support"
        >
          Go back to all tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-7xl">
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
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-white md:text-3xl">
            {ticket.title}
          </h1>
          <p className="mt-2 text-sm text-gray-400">{ticket.id}</p>
          <div className="mt-2 flex items-center gap-2 border-b border-gray-600 pb-2 text-white">
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
            <p className="text-sm font-extralight text-gray-200">
              <span className="font-semibold">{ticket.user.name}</span> opened
              this ticket{" "}
              {formatRelative(new Date(ticket.createdAt), new Date())}
              <span> · </span>
              <span>{ticket.comments.length} comments</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-white/10 bg-gray-800">
        <div className="flex h-full items-center gap-2 rounded-t-md border-b border-white/10 bg-gray-900 px-4 py-2">
          {ticket.user.image && (
            <img
              className="h-6 w-6 rounded-full"
              src={ticket.user.image}
              alt={ticket.user.name}
            />
          )}{" "}
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-white">{ticket.user.name}</span>{" "}
            commented{" "}
            <span
              className="cursor-default hover:text-green-600"
              title={formatRelative(new Date(ticket.createdAt), new Date())}
            >
              {formatDistance(new Date(ticket.createdAt), new Date())} ago
            </span>
          </p>
        </div>
        <div className="px-4 py-2">
          <pre
            className="mt-2 text-sm text-gray-300"
            key={ticket.id}
            dangerouslySetInnerHTML={{
              __html: ticketContent,
            }}
          ></pre>
        </div>
      </div>
    </div>
  );
}
