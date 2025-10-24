import { createFileRoute } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links";
import RequestPasswordResetForm from "~/components/request-password-reset-form";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";

export const Route = createFileRoute("/(auth)/reset-password")({
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="flex w-100 grow flex-col justify-center self-center">
      <Card>
        <CardHeader>Reset Password</CardHeader>
        <RequestPasswordResetForm />
        <CardFooter>
          <AuthLinks
            showSignIn
            showSignUp
            showForgotPassword={false}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
