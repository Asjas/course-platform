import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loading from "~/components/loading.tsx";
import { renderMarkdown } from "~/lib/markdown.ts";
import { trpc } from "~/lib/trpc.client";

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
  const [ticketContent, setTicketContent] = useState("");
  const [copied, setCopied] = useState(false);
  const params = useParams({ from: "/support/$supportTicket/" });
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
    <div className="mx-auto mt-20 w-full max-w-7xl">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-white md:text-3xl">
            Support Ticket
          </h1>
          <p className="mt-2 text-sm text-gray-300">{ticket.id}</p>
        </div>
        <div className="mt-4 flex gap-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            className="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
            to="/support"
          >
            Back to all tickets
          </Link>
          {copied ? (
            <button
              className="block rounded-md px-3 py-2 text-center text-sm font-semibold text-white hover:cursor-pointer hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              title="Copied"
            >
              <CheckIcon
                size={18}
                color="green"
              />
            </button>
          ) : (
            <button
              className="block rounded-md px-3 py-2 text-center text-sm font-semibold text-white hover:cursor-pointer hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
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
      </div>
      <div className="mt-10 rounded-md border border-white/10 bg-gray-800 shadow-sm">
        <div className="flex h-full items-center rounded-t-md border-b border-white/10 bg-gray-900 px-4 py-2">
          <p className="text-sm text-gray-300">
            {ticket.user.name} opened this ticket on{" "}
            {formatRelative(new Date(ticket.createdAt), new Date())}
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
