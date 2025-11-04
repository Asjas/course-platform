import { createFileRoute } from "@tanstack/react-router";
import NewSupportTicketForm from "~/components/create-support-ticket-form";

export const Route = createFileRoute("/support/create-ticket")({
  component: SupportCreateTicketPage,
});

function SupportCreateTicketPage() {
  return (
    <div className="mx-auto mt-10 w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-lg font-bold md:text-3xl">
        Create Support Ticket
      </h1>
      <p className="mb-8 text-sm text-gray-400">
        Please fill out the form below to create a support ticket.
      </p>
      <NewSupportTicketForm />
    </div>
  );
}
