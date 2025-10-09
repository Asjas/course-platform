import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { Toaster } from "~/components/ui/sonner.tsx";
import { type AuthState } from "~/lib/auth.context";

interface MyRouterContext {
  auth: AuthState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootRoute,
});

function RootRoute() {
  const { auth } = Route.useRouteContext();

  return (
    <>
      <a
        className="sr-only mt-20 focus:not-sr-only focus:inline-flex"
        href="#maincontent"
      >
        Skip to main
      </a>
      <Toaster />
      <div className="grid min-h-screen grid-rows-[1fr_auto]">
        <Header auth={auth} />
        <main
          className="flex flex-col overflow-y-auto pt-20"
          id="maincontent"
        >
          <Outlet />
        </main>
        <Footer />
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </>
  );
}
