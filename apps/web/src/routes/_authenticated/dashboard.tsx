import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: AuthenticatedDashboard,
});

function AuthenticatedDashboard() {
  return <div>Hello /_authenticated/dashboard!</div>;
}
