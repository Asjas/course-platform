import { createFileRoute } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links";
import SignInForm from "~/components/sign-in-form";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";

export const Route = createFileRoute("/(auth)/signin")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="flex w-100 grow flex-col justify-center self-center">
      <Card>
        <CardHeader>Sign In to Your Account</CardHeader>
        <SignInForm />
        <hr className="mt-4 border-gray-600" />
        <CardFooter>
          <AuthLinks showSignIn={false} />
        </CardFooter>
      </Card>
    </div>
  );
}
