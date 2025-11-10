import type { SupportTicketById } from "@apps/server/src/routers/support-tickets/queries.ts";
import { formatDistance, formatRelative } from "date-fns";
import { EllipsisIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "~/lib/auth.context.ts";
import { renderMarkdown } from "~/lib/markdown.ts";
import { cn } from "~/lib/utils.ts";

export default function SupportComment({
  ticket,
  content,
  date,
}: {
  ticket: NonNullable<SupportTicketById>;
  content: string;
  date: Date;
}) {
  const [ticketContent, setTicketContent] = useState("");
  const auth = useAuth();

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
      <div className="flex items-center justify-between rounded-t-md border-b border-white/10 bg-gray-900 px-4 py-2">
        <div className="flex h-full items-center gap-2">
          {ticket.user.image && (
            <img
              className="h-6 w-6 rounded-full"
              src={ticket.user.image}
              alt={ticket.user.name}
            />
          )}
          <p className="text-[12px] text-gray-400">
            <span className="text-sm font-semibold text-white">
              {ticket.user.name}
            </span>{" "}
            commented{" "}
            <span
              className="cursor-default hover:text-green-600"
              title={formatRelative(new Date(date), new Date())}
            >
              {formatDistance(new Date(date), new Date())} ago
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {auth.session?.user.id === ticket.user.id && (
            <span
              className="rounded-lg border px-2 py-0.5 text-[12px] text-gray-400"
              title="This user is the author of this issue"
            >
              Author
            </span>
          )}
          {auth.session?.user.id === ticket.user.id || auth.hasRole("admin") ? (
            <button
              className="cursor-pointer rounded-md p-1.5 hover:bg-gray-700 active:bg-gray-700/80"
              title="More options"
            >
              <EllipsisIcon
                size={18}
                color="var(--color-gray-400)"
              />
            </button>
          ) : null}
        </div>
      </div>
      <div className="custom-scrollbar min-h-[180px] max-w-screen overflow-auto rounded-b-md bg-gray-900">
        <div
          className={cn(
            "min-w-fit text-base",
            "prose prose-sm prose-invert p-6",
            "text-white",
            "[&_code]:overflow-visible! [&_pre]:overflow-visible!",
          )}
          key={ticket.id}
          dangerouslySetInnerHTML={{
            __html: ticketContent,
          }}
        ></div>
      </div>
    </div>
  );
}
