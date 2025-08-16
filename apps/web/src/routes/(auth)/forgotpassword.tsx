import { createFileRoute } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links";
import PasswordResetForm from "~/components/password-reset-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const Route = createFileRoute("/(auth)/forgotpassword")({
  component: AuthPage,
});

export default function AuthPage() {
  return (
    <div className="flex size-full grow flex-col items-center justify-center gap-3">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            Enter your account email and we'll send instructions to reset your
            password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <PasswordResetForm />
        </CardContent>

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
