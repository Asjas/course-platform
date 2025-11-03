import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import DefaultLayoutComponent from "~/components/default-layout.tsx";
import { type AuthState } from "~/lib/auth.context";

interface MyRouterContext {
  auth: AuthState;
  queryClient: QueryClient;
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
