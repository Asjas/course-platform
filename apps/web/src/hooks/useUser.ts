import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { authClient } from "~/lib/auth.client.ts";
import { AUTH_QUERY_KEY } from "~/lib/query.client.ts";

async function fetchUser() {
  const session = await authClient.getSession();

  return session.data || null;
}

export function useUser() {
  const queryClient = useQueryClient();

  // Query for user data (cached, with localStorage hydration)
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchUser,
    initialDataUpdatedAt: () => {
      // Hydrate from localStorage on mount
      const storedUser = localStorage.getItem("user");
      return storedUser ? Date.now() : 0;
    },
    initialData: () => {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : undefined;
    },
    staleTime: Infinity, // Treat as "owned" state; only invalidate on mutation
  });

  // Persist to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Mutation for sign-out (integrates with Better Auth)
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null); // Invalidate cache
      localStorage.removeItem("user");
    },
  });

  return {
    user,
    isLoading,
    error,
    signOut: signOutMutation.mutate,
  };
}
