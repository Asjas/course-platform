import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  return <div>Hello /settings!</div>;
}
