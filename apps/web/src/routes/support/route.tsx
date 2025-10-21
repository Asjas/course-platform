import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  component: SupportLayoutComponent,
});

function SupportLayoutComponent() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Outlet />
    </div>
  );
}
