import { Link, createFileRoute, useSearch } from "@tanstack/react-router";
import * as z from "zod";
import NewSupportTicketForm from "~/components/forms/create-support-ticket-form";

const searchSchema = z.object({
  courseSlug: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/chat/support/new")({
  validateSearch: searchSchema,
  component: ChatSupportCreateTicketPage,
});

function ChatSupportCreateTicketPage() {
  const { courseSlug } = useSearch({
    from: "/_authenticated/chat/support/new",
  });

  return (
    <div className="flex h-full flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Create Support Ticket
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Please fill out the form below to create a support ticket.
          </p>
        </div>

        <div className="flex sm:mt-0 sm:ml-16 sm:flex-none">
          {courseSlug ? (
            <Link
              className="inline-flex items-center rounded-md bg-green-600 px-2 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-800"
              to="/chat/support/$courseSlug"
              params={{ courseSlug }}
            >
              Back to chat
            </Link>
          ) : (
            <Link
              className="inline-flex items-center rounded-md bg-green-600 px-2 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-800"
              to="/chat/$channelId"
              params={{ channelId: "general" }}
            >
              Back to chat
            </Link>
          )}
        </div>
      </div>

      <NewSupportTicketForm />
    </div>
  );
}
