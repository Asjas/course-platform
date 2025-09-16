import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { ThemeProvider } from "~/components/theme-provider";

export const Route = createRootRoute({
  component: () => (
    <>
      <ThemeProvider
        defaultTheme="dark"
        storageKey="cw-ui-theme"
      >
        <Header />
        <main className="flex min-h-screen overflow-y-auto pt-20">
          <Outlet />
        </main>
        <Footer />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
});
