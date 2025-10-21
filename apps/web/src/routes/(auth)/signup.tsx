import { createFileRoute } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links";
import SignUpForm from "~/components/sign-up-form";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";
import { useAuth } from "~/lib/auth.context.ts";

export const Route = createFileRoute("/(auth)/signup")({
  component: AuthPage,
});

function AuthPage() {
  const auth = useAuth();

  return (
    <div className="flex w-100 grow flex-col justify-center self-center">
      <Card>
        <CardHeader>Account Signup</CardHeader>
        <SignUpForm auth={auth} />
        <hr className="mt-4 border-gray-600" />
        <CardFooter>
          <AuthLinks showSignUp={false} />
        </CardFooter>
      </Card>
    </div>
  );
}
