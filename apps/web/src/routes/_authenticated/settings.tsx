import { createFileRoute } from "@tanstack/react-router";
import ProfileForm from "~/components/profile-form.tsx";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  return <ProfileForm />;
}
