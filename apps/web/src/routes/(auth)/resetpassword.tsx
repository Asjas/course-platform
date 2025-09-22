import { createFileRoute } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links";
import PasswordResetForm from "~/components/password-reset-form";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";

export const Route = createFileRoute("/(auth)/resetpassword")({
  component: AuthPage,
});

function AuthPage() {
  return (
    <main className="w-100 flex grow flex-col justify-center self-center">
      <Card>
        <CardHeader>Reset Password</CardHeader>
        <PasswordResetForm />
        <CardFooter>
          <AuthLinks
            showSignIn
            showSignUp
            showForgotPassword={false}
          />
        </CardFooter>
      </Card>
    </main>
  );
}
