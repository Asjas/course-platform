import { toast } from "@packages/shared-ui/ui/sonner";
import {
  adminClient,
  anonymousClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [adminClient(), anonymousClient(), usernameClient()],
  fetchOptions: {
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
