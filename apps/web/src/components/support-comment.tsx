import type { SupportTicketById } from "@apps/server/src/routers/support-tickets/queries.ts";
import { formatDistance, formatRelative } from "date-fns";
import { useEffect, useState } from "react";
import { renderMarkdown } from "~/lib/markdown.ts";

export default function SupportComment({
  ticket,
  content,
}: {
  ticket: NonNullable<SupportTicketById>;
  content: string;
}) {
  const [ticketContent, setTicketContent] = useState("");

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const html = await renderMarkdown(content);

      if (isMounted) {
        setTicketContent(html);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [ticket, content]);

  return (
    <div className="rounded-md border border-white/10 bg-gray-800">
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
      <div className="rounded-b-md bg-gray-900/65 px-4 py-2">
        <pre
          className="mt-2 text-sm text-white"
          key={ticket.id}
          dangerouslySetInnerHTML={{
            __html: ticketContent,
          }}
        ></pre>
      </div>
    </div>
  );
}
