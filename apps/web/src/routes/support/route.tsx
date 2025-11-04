import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  component: SupportLayoutPage,
});

function SupportLayoutPage() {
  return <Outlet />;
}
