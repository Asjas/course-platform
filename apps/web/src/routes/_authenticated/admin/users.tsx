import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "~/lib/trpc.client.ts";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsersComponent,
});

function AdminUsersComponent() {
  const { data } = useQuery(trpc.users.getAllUsers.queryOptions());

  console.log("users", data);

  return <div>Hello "/_admin/users"!</div>;
}
