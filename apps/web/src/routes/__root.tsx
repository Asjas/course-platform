import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { ThemeProvider } from "~/components/theme-provider";

export const Route = createRootRoute({
  component: () => (
    <>
      <a
        className="sr-only mt-20 focus:not-sr-only focus:inline-flex"
        href="#maincontent"
      >
        Skip to main
      </a>
      <div className="grid min-h-screen grid-rows-[1fr_auto]">
        <ThemeProvider
          defaultTheme="dark"
          storageKey="cw-ui-theme"
        >
          <Header />
          <div
            className="flex flex-col overflow-y-auto pt-20"
            id="maincontent"
          >
            <Outlet />
          </div>
          <Footer />
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </>
  ),
});
