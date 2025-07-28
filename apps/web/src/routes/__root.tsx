import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "~/components/theme-provider";
import { UIProvider } from "~/lib/auth-ui.provider";

export const Route = createRootRoute({
  component: () => (
    <>
      <ThemeProvider
        defaultTheme="dark"
        storageKey="cw-ui-theme"
      >
        <UIProvider>
          <Outlet />
        </UIProvider>
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
});
