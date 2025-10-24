import { createFileRoute, useParams } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links";
import PasswordResetForm from "~/components/password-reset-form.tsx";
import RequestPasswordResetForm from "~/components/request-password-reset-form";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";

export const Route = createFileRoute("/(auth)/reset-password")({
  parseParams: (params: Record<string, string>) => ({
    token: params.token ? String(params.token) : undefined,
  }),
  stringifyParams: ({ token }) => ({ token: token ?? "" }),
  component: AuthPage,
});

function AuthPage() {
  const { token } = useParams({ from: "/(auth)/reset-password" });

  return (
    <div className="flex w-100 grow flex-col justify-center self-center">
      <Card>
        <CardHeader>Reset Password</CardHeader>
        {token ? (
          <>
            <PasswordResetForm token={token} />
            <CardFooter>
              <AuthLinks showSignUp={false} />
            </CardFooter>
          </>
        ) : (
          <>
            <RequestPasswordResetForm />
            <CardFooter>
              <AuthLinks
                showSignIn
                showSignUp
                showForgotPassword={false}
              />
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
