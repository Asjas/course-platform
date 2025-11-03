import { Link, createFileRoute } from "@tanstack/react-router";
import CreateCouponForm from "~/components/create-coupon-form.tsx";

export const Route = createFileRoute("/_authenticated/admin/coupons/create/")({
  component: AdminCouponsCreatePage,
});

function AdminCouponsCreatePage() {
  return (
    <div className="py-2">
      <Link
        className="underline hover:no-underline"
        to="/_authenticated/admin/coupons"
      >
        Back to Coupons
      </Link>
      <div className="mt-10">
        <h1 className="mb-10 text-3xl">Create a new coupon</h1>
        <CreateCouponForm />
      </div>
    </div>
  );
}
