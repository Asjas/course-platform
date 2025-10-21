import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/support/$supportTicket/edit/")({
  beforeLoad: async ({ context }) => {
    const { auth } = context;

    if (auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    // TODO: Add additional authorization logic here (e.g., check if the user has permission to edit the ticket)
  },
  component: SupportTicketEditIndexPage,
});

function SupportTicketEditIndexPage() {
  return <div>Hello "/support/$supportTicket/edit"!</div>;
}
