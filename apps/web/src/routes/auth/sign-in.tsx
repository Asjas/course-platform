import { AuthCard } from "@daveyplate/better-auth-ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-in")({
  component: AuthPage,
});

export default function AuthPage() {
  return (
    <div className="flex size-full grow flex-col items-center justify-center gap-3">
      <AuthCard view="SIGN_IN" />
    </div>
  );
}
