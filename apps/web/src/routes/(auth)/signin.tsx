import { createFileRoute } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links";
import SignInForm from "~/components/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const Route = createFileRoute("/(auth)/signin")({
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="flex size-full grow flex-col items-center justify-center gap-3">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Sign in with your email and password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <SignInForm />
        </CardContent>

        <CardFooter>
          <AuthLinks
            showSignIn={false}
            showSignUp
            showForgotPassword
          />
        </CardFooter>
      </Card>
    </div>
  );
}
