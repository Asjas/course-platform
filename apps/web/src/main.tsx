import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { defaultAuthState, useAuth } from "~/lib/auth.context";
import { AuthProvider } from "~/lib/auth.provider";
import { queryClient } from "~/lib/query.client.ts";
import reportWebVitals from "~/reportWebVitals";
import { routeTree } from "~/routeTree.gen";
import "~/tailwind.css";

const router = createRouter({
  routeTree,
  context: {
    auth: defaultAuthState,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
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
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AuthProvider>
    </StrictMode>,
  );
}

reportWebVitals(console.log);
