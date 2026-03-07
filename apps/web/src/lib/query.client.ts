import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getBackendErrorMessage, isAccessDeniedError } from "~/lib/api-error";

function showAccessDeniedToast(error: unknown) {
  if (!isAccessDeniedError(error)) {
    return;
  }

  toast.error(
    getBackendErrorMessage(
      error,
      "Access denied. You do not have permission for this action.",
    ),
    {
      id: "access-denied-error",
    },
  );
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: showAccessDeniedToast,
  }),
  mutationCache: new MutationCache({
    onError: showAccessDeniedToast,
  }),
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 0,
    },
  },
});
