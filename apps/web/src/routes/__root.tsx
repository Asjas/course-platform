import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { Toaster } from "~/components/ui/sonner.tsx";

export const Route = createRootRoute({
  component: RootRoute,
});

function RootRoute() {
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
        <Header />
        <main
          className="flex flex-col overflow-y-auto pt-20"
          id="maincontent"
        >
          <Outlet />
        </main>
        <Footer />

        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </>
  );
}
