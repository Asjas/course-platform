import { Link, createFileRoute } from "@tanstack/react-router";
import NewSupportTicketForm from "~/components/forms/create-support-ticket-form";

export const Route = createFileRoute("/support/create-ticket")({
  component: SupportCreateTicketPage,
});

function SupportCreateTicketPage() {
  return (
    <div className="mx-auto mt-10 w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-white md:text-3xl">
            Create Support Ticket
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Please fill out the form below to create a support ticket.
          </p>
        </div>

        <div className="flex sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            className="inline-flex items-center rounded-md bg-green-600 px-2 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-800"
            to="/support"
          >
            Back to all tickets
          </Link>
        </div>
      </div>

      <NewSupportTicketForm />
    </div>
  );
}
