import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { queryClient } from "~/lib/query.client.ts";
import { trpc } from "~/lib/trpc.client.ts";

export const Route = createFileRoute("/_authenticated/admin/users")({
  loader: async () => {
    return await queryClient.ensureQueryData(
      trpc.users.getAllUsers.queryOptions(),
    );
  },
  component: AdminUsersComponent,
});

function AdminUsersComponent() {
  const { data } = useQuery(trpc.users.getAllUsers.queryOptions());

  console.log("users", data);

  return <div>Hello "/_admin/users"!</div>;
}
