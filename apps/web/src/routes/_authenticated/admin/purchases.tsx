import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/purchases")({
  component: AdminPurchasesPage,
});

function AdminPurchasesPage() {
  return <div>Hello "/_authenticated/admin/purchases"!</div>;
}
