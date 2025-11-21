import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: Infinity,
    },
  },
});

export const getChannelCacheKey = (channelId: string) =>
  ["chat", "messages", channelId] as const;
