import { createFileRoute } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links";
import SignInForm from "~/components/sign-in-form";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";

export const Route = createFileRoute("/(auth)/signin")({
  component: AuthPage,
});

function AuthPage() {
  return (
    <main className="w-100 flex grow flex-col justify-center self-center">
      <Card>
        <CardHeader>Account Signin</CardHeader>
        <SignInForm />
        <hr className="mt-4 border-gray-600" />
        <CardFooter>
          <AuthLinks showSignIn={false} />
        </CardFooter>
      </Card>
    </main>
  );
}
