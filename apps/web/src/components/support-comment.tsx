import type { SupportTicketById } from "@apps/server/src/routers/support-tickets/queries";
import { formatDistance, intlFormat } from "date-fns";
import { EllipsisIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Menu,
  Button as MenuButton,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { MarkdownContent } from "~/components/markdown-content";
import { useAuth } from "~/lib/auth.context";
import { renderMarkdown } from "~/lib/markdown";
import { cn } from "~/lib/utils";

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

  function handleEdit() {
    // Edit functionality can be implemented here
    alert("Edit functionality is not implemented yet.");
  }

  function handleDelete() {
    // Delete functionality can be implemented here
    alert("Delete functionality is not implemented yet.");
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800">
      <div className="flex items-center justify-between rounded-t-md border-b border-gray-200 bg-gray-100 px-4 py-2 dark:border-white/10 dark:bg-gray-900">
        <div className="flex h-full items-center gap-2">
          {ticket.user.image && (
            <img
              className="h-6 w-6 rounded-full"
              src={ticket.user.image}
              alt={ticket.user.name}
            />
          )}
          <p className="text-[12px] text-gray-400">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {ticket.user.name}
            </span>{" "}
            commented{" "}
            <span
              className="cursor-default hover:text-green-600"
              title={intlFormat(new Date(date), {
                day: "numeric",
                year: "numeric",
                month: "long",
                minute: "numeric",
                hour: "numeric",
              })}
            >
              {formatDistance(new Date(date), new Date())} ago
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {auth.session?.user.id === ticket.user.id && (
            <span
              className="rounded-lg border border-gray-300 px-2 py-0.5 text-[12px] text-gray-500 dark:border-gray-600 dark:text-gray-400"
              title="This user is the author of this issue"
            >
              Author
            </span>
          )}
          {auth.session?.user.id === ticket.user.id || auth.hasRole("admin") ? (
            <MenuTrigger>
              <MenuButton
                className="mr-2 cursor-pointer rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Message actions"
              >
                <EllipsisIcon
                  size={18}
                  color="var(--color-gray-400)"
                />
              </MenuButton>

              <Popover className="z-50">
                <Menu className="min-w-30 rounded-md border border-gray-300 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <MenuItem
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    onAction={handleEdit}
                  >
                    Edit
                  </MenuItem>

                  <MenuItem
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                    onAction={handleDelete}
                  >
                    Delete
                  </MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>
          ) : null}
        </div>
      </div>
      <div className="custom-scrollbar min-h-0 max-w-screen overflow-auto rounded-b-md bg-white dark:bg-gray-900">
        <MarkdownContent
          className={cn(
            "min-w-fit text-base",
            "prose prose-sm dark:prose-invert p-6",
            "text-gray-900 dark:text-white",
            "[&_code]:overflow-visible! [&_pre]:overflow-visible!",
          )}
          html={ticketContent}
          key={ticket.id}
        />
      </div>
    </div>
  );
}
