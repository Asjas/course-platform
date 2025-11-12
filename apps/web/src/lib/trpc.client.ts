import type { AppRouter } from "@apps/server/src/routers";
import { invariant } from "@epic-web/invariant";
import {
  createTRPCClient,
  httpBatchStreamLink,
  httpSubscriptionLink,
  splitLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";
import { queryClient } from "~/lib/query.client";

const VITE_TRPC_URL = import.meta.env.VITE_TRPC_URL;

invariant(
  VITE_TRPC_URL,
  "VITE_TRPC_URL is not defined in your environment variables.",
);

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === "subscription",
      true: httpSubscriptionLink({
        url: VITE_TRPC_URL,
        eventSourceOptions() {
          return {
            withCredentials: true,
          };
        },
        transformer: superjson,
      }),
      false: httpBatchStreamLink({
        url: VITE_TRPC_URL,
        fetch: (url, options) => {
          return fetch(url, { ...options, credentials: "include" });
        },
        transformer: superjson,
      }),
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
