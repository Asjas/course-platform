import { useParams } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import AuthLinks from "~/components/auth-links.tsx";
import PasswordResetForm from "~/components/password-reset-form";
import { Card, CardFooter, CardHeader } from "~/components/ui/card.tsx";

export const Route = createFileRoute("/(auth)/reset-password/$token")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = useParams({ from: "/(auth)/reset-password/$token" });

  return (
    <div>
      <div className="flex w-100 grow flex-col justify-center self-center">
        <Card>
          <CardHeader>Reset Password</CardHeader>
          <PasswordResetForm token={token} />
          <CardFooter>
            <AuthLinks showSignUp={false} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
