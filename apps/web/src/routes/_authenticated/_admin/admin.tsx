import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin/admin")({
  component: AdminComponent,
});

function AdminComponent() {
  return <div>Hello</div>;
}
