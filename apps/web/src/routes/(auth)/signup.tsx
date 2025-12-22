import { createFileRoute } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links";
import SignUpForm from "~/components/forms/sign-up-form";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";

export const Route = createFileRoute("/(auth)/signup")({
  component: AuthSignUpPage,
});

function AuthSignUpPage() {
  return (
    <div className="flex w-100 grow flex-col justify-center self-center">
      <Card>
        <CardHeader>Account Signup</CardHeader>
        <SignUpForm />
        <hr className="mt-4 border-gray-300 dark:border-gray-600" />
        <CardFooter>
          <AuthLinks showSignUp={false} />
        </CardFooter>
      </Card>
    </div>
  );
}
