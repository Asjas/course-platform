import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersComponent,
});

function AdminUsersComponent() {
  return <div>Hello "/_admin/users"!</div>;
}
