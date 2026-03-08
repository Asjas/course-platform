import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { act, render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  initialPath?: string;
}

/**
 * Renders a component inside a real TanStack Router (memory history) and a
 * real QueryClient.  The helper is **async** because RouterProvider resolves
 * its route tree asynchronously — callers must `await` the result.
 *
 * Navigation assertions use `router.state.location.pathname` instead of
 * inspecting a mocked `useNavigate` function.
 */
export async function renderWithProviders(
  ui: React.ReactElement,
  { initialPath = "/", ...renderOptions }: RenderWithProvidersOptions = {},
) {
  const queryClient = createTestQueryClient();
  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    ),
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  const result = render(<RouterProvider router={router} />, renderOptions);
  // RouterProvider resolves its route tree async; we must flush that work
  // before assertions can see any rendered output.
  await act(async () => {
    await router.load();
  });
  return { ...result, router, queryClient };
}

export function renderWithQueryClient(
  ui: React.ReactElement,
  renderOptions?: RenderOptions,
) {
  const queryClient = createTestQueryClient();
  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    renderOptions,
  );
  return { ...result, queryClient };
}
