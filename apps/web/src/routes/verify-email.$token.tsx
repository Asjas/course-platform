import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "~/lib/auth.client.ts";

export const Route = createFileRoute("/verify-email/$token")({
  loader: async ({ params }) => {
    const token = params.token;

    const isValid = await authClient.verifyEmail({ query: { token } });

    if (isValid) {
      throw redirect({ to: "/dashboard" });
    } else {
      throw redirect({ to: "/signin" });
    }
  },
});
