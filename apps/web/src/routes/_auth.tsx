import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "~/lib/auth.client.ts";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ location }) => {
    const { data } = await authClient.getSession();

    console.log("auth data", data);

    if (!data?.session) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
