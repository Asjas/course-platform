import { createFileRoute } from "@tanstack/react-router";
import NewSupportTicketForm from "~/components/new-support-ticket-form.tsx";

export const Route = createFileRoute("/support/create-ticket")({
  component: SupportCreateTicketPage,
});

function SupportCreateTicketPage() {
  return (
    <div className="mt-10 max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-xl font-bold">Create Support Ticket</h1>
      <p className="mb-8 text-base text-gray-400">
        Please fill out the form below to create a support ticket.
      </p>
      <NewSupportTicketForm />
    </div>
  );
}
