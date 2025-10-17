import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  component: SupportLayoutComponent,
});

function SupportLayoutComponent() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Support</h1>
      <p className="text-lg text-gray-400">
        Welcome to the support page. How can we assist you today?
      </p>
    </div>
  );
}
