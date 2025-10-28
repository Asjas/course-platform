import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context, location }) => {
    const { auth } = context;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }

    if (!auth.hasRole("admin")) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: AdminPageLayout,
});

function AdminPageLayout() {
  return <Outlet />;
}
