import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 0,
    },
  },
});

export const getChannelCacheKey = (channelId: string) =>
  ["chat", "messages", channelId] as const;
