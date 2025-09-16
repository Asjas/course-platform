import { createFileRoute } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links";
import SignUpForm from "~/components/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const Route = createFileRoute("/(auth)/signup")({
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="flex size-full grow flex-col items-center justify-center gap-3">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Account Signup</CardTitle>
          <CardDescription>
            Enter your email, username, and password to create a new account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <SignUpForm />
        </CardContent>

        <CardFooter>
          <AuthLinks
            showSignIn
            showSignUp={false}
            showForgotPassword
          />
        </CardFooter>
      </Card>
    </div>
  );
}
