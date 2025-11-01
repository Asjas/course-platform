import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import DefaultLayoutComponent from "~/components/default-layout";
import { type AuthState } from "~/lib/auth.context";
import { trpc } from "~/lib/trpc.client";

interface MyRouterContext {
  auth: AuthState;
  queryClient: QueryClient;
  trpc: typeof trpc;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootRoute,
});

function RootRoute() {
  return (
    <DefaultLayoutComponent>
      <Outlet />
    </DefaultLayoutComponent>
  );
}
