import { invariant } from "@tanstack/react-router";
import {
  adminClient,
  anonymousClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "~/components/ui/sonner";

const { VITE_BETTER_AUTH_URL } = import.meta.env;

invariant(VITE_BETTER_AUTH_URL);

export const authClient = createAuthClient({
  baseURL: VITE_BETTER_AUTH_URL,
  basePath: "/api/auth",
  plugins: [adminClient(), anonymousClient(), usernameClient()],
  fetchOptions: {
    credentials: "include",
    onError: async (context) => {
      const { response } = context;

      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        const message = `Rate limit exceeded. Retry after ${retryAfter} seconds.`;

        console.error(message);
        toast.error(message);
      }
    },
  },
});

export type AuthClient = ReturnType<typeof createAuthClient>;
export type AuthSession = AuthClient["$Infer"]["Session"];
