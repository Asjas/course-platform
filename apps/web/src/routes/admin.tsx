import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context }) => {
    const { user, session } = context;

    if (!session) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: "/admin",
        },
      });
    }

    if (user?.role !== "admin") {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
