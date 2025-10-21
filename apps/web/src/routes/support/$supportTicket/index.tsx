import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support/$supportTicket/")({
  component: SupportTicketIndexPage,
});

function SupportTicketIndexPage() {
  return <div>Hello "/support/$supportTicket"!</div>;
}
