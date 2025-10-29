import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  component: SupportLayoutPage,
});

function SupportLayoutPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Outlet />
    </div>
  );
}
