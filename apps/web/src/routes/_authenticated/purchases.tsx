import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/purchases")({
  component: AuthenticatedPurchasesPage,
});

function AuthenticatedPurchasesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p>Redirecting you to the Polar.sh purchases portal.</p>
      <p>Please wait...</p>
    </div>
  );
}
