import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    const { auth, queryClient } = context;

    if (!auth.isAuthenticated || !auth.session) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }

    // Fetch the current user's data to check for bans
    const user = await queryClient.ensureQueryData(
      context.trpc.users.getUserById.queryOptions({
        userId: auth.session.user.id,
      }),
    );

    if (user?.banned) {
      throw new Error(
        `Your account has been banned. The ban expires on ${user.banExpires}`,
      );
    }

    // Return the user data to cache it for child routes
    return user;
  },
  component: AuthenticatedPageLayout,
});

function AuthenticatedPageLayout() {
  return <Outlet />;
}
