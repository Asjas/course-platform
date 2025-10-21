import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "~/lib/trpc.client.ts";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const { data } = useQuery(
    trpc.users.getUserById.queryOptions({ userId: "123" }),
  );

  console.log("users", data);

  return <div>Hello /settings!</div>;
}
