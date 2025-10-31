import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    const { auth } = context;

    if (!auth.isAuthenticated || !auth.session) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }

    if (auth.session.user?.banned) {
      throw new Error(
        `Your account has been banned. The ban expires on ${auth.session.user.banExpires}`,
      );
    }

    return auth.session.user;
  },
  component: AuthenticatedPageLayout,
});

function AuthenticatedPageLayout() {
  return <Outlet />;
}
