import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support/$supportTicket/edit")({
  component: SupportTicketEditRouteComponent,
});

function SupportTicketEditRouteComponent() {
  return <Outlet />;
}
