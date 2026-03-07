import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import AdminLayout from "~/components/layouts/admin-layout";

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
        search: {
          accessDenied: "admin",
        },
      });
    }

    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      throw redirect({
        to: "/admin/stats",
      });
    }
  },
  component: AdminPageLayout,
});

function AdminPageLayout() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
