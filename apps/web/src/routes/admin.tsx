import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "~/lib/auth.client.ts";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();

    if (!data?.session) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: "/admin",
        },
      });
    }

    if (data?.user?.role !== "admin") {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
