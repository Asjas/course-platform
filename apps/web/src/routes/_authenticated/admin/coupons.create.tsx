import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/coupons/create")({
  component: CouponsCreateComponent,
});

function CouponsCreateComponent() {
  return <div>Hello "/_authenticated/admin/coupons/create"!</div>;
}
