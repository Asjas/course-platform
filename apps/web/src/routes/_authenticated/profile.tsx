import { createFileRoute } from "@tanstack/react-router";
import ProfileForm from "~/components/profile-form.tsx";

export const Route = createFileRoute("/_authenticated/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto">
      <ProfileForm />
    </div>
  );
}
