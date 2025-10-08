import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode, useState } from "react";
import ReactDOM from "react-dom/client";
import { sessionData, userData } from "~/lib/auth.client.ts";
import reportWebVitals from "~/reportWebVitals";
import { routeTree } from "~/routeTree.gen";
import "~/tailwind.css";

const router = createRouter({
  routeTree,
  context: {
    user: userData,
    session: sessionData,
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
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  return (
    <RouterProvider
      router={router}
      context={{
        user: userData,
        session: sessionData,
        isUnauthorized,
        setIsUnauthorized,
      }}
    />
  );
}

const rootElement = document.getElementById("app");

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

reportWebVitals(console.log);
