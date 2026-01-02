import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/sync-status")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/sync-status"!</div>;
}
