import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "~/lib/auth.client";

export const Route = createFileRoute("/verify-email/$token")({
  loader: async ({ params }) => {
    const token = params.token;

    const isValid = await authClient.verifyEmail({ query: { token } });

    if (isValid) {
      throw redirect({ to: "/dashboard" });
    } else {
      return { status: "error", message: "Invalid or expired token" };
    }
  },
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { message } = Route.useLoaderData();

  return (
    <div className="flex w-100 grow flex-col justify-center self-center">
      <p className="text-center text-lg">{message}</p>
    </div>
  );
}
