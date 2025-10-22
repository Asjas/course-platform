import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/purchases")({
  component: AdminPurchasesComponent,
});

function AdminPurchasesComponent() {
  return <div>Hello "/_authenticated/admin/purchases"!</div>;
}
