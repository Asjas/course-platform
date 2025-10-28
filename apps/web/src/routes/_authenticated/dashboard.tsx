import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: AuthenticatedDashboardPage,
});

function AuthenticatedDashboardPage() {
  return <div>Hello /_authenticated/dashboard!</div>;
}
