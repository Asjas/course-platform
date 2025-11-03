import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/admin/coupons/edit/index/$couponId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/admin/coupons/edit/"!</div>;
}
