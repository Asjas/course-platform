import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import ErrorBoundaryComponent from "~/components/error-boundary.tsx";
import NotFoundComponent from "~/components/not-found.tsx";
import { defaultAuthState, useAuth } from "~/lib/auth.context";
import { AuthProvider } from "~/lib/auth.provider";
import { queryClient } from "~/lib/query.client.ts";
import { trpc } from "~/lib/trpc.client.ts";
import reportWebVitals from "~/reportWebVitals";
import { routeTree } from "~/routeTree.gen";
import "~/tailwind.css";

const router = createRouter({
  routeTree,
  context: {
    auth: defaultAuthState,
    queryClient,
    trpc,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: ErrorBoundaryComponent,
  defaultNotFoundComponent: NotFoundComponent,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const auth = useAuth();

  return (
    <RouterProvider
      router={router}
      context={{ auth }}
    />
  );
}

const rootElement = document.getElementById("app");

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

reportWebVitals(console.log);
