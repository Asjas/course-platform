import { queryClient } from "./query.client.ts";
import type { AppRouter } from "@apps/server/src/routers";
import { invariant } from "@epic-web/invariant";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

const VITE_TRPC_URL = import.meta.env.VITE_TRPC_URL;

invariant(
  VITE_TRPC_URL,
  "VITE_TRPC_URL is not defined in your environment variables.",
);

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchStreamLink({
      url: VITE_TRPC_URL,
      fetch: (url, options) => {
        return fetch(url, { ...options, credentials: "include" });
      },
      transformer: superjson,
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
