import { QueryClient } from "@tanstack/react-query";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: STALE_TIME,
    },
  },
});

export const AUTH_QUERY_KEY = ["auth"];
