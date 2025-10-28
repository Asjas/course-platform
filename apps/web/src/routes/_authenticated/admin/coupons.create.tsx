import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/coupons/create")({
  component: AdminCouponsCreatePage,
});

function AdminCouponsCreatePage() {
  return <div>Hello "/_authenticated/admin/coupons/create"!</div>;
}
