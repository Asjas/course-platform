import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support/")({
  component: SupportIndexPage,
});

function SupportIndexPage() {
  return (
    <div className="mt-20">
      <div className="flex items-center justify-between">
        <h1 className="mb-4 text-3xl font-bold">Support</h1>
        <Link
          className="underline hover:no-underline"
          to="/support/create-ticket"
        >
          Create support ticket
        </Link>
      </div>
      <p className="text-lg text-gray-400">
        Welcome to the support page. How can we assist you today?
      </p>
    </div>
  );
}
