import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PencilIcon } from "lucide-react";
import Loading from "~/components/loading.tsx";
import { trpc } from "~/lib/trpc.client.ts";

export const Route = createFileRoute("/_authenticated/admin/coupons/")({
  loader: async ({ context }) => {
    const { queryClient } = context;

    queryClient.ensureQueryData(trpc.coupons.getAllCoupons.queryOptions());
  },
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  const { data: coupons, isLoading } = useSuspenseQuery(
    trpc.coupons.getAllCoupons.queryOptions(),
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-8 py-2">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl">Coupons</h1>
        <Link
          className="underline hover:no-underline"
          to="/admin/coupons/create"
        >
          Create New Coupon
        </Link>
      </div>
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coupons?.map((coupon) => (
          <div
            className="rounded-lg border border-gray-200 p-6 shadow-md transition-shadow hover:shadow-lg"
            key={coupon.id}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white">
                  {coupon.code}
                  <Link
                    to="/admin/coupons/edit/index/$couponId"
                    params={{ couponId: coupon.id }}
                  >
                    <PencilIcon className="ml-2 inline-block h-4 w-4 hover:text-gray-400" />
                  </Link>
                </span>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    coupon.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {coupon.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-white">
                  <strong>Type:</strong> {coupon.discountType}
                </p>
                <p className="text-white">
                  <strong>Value:</strong>{" "}
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : `$${coupon.discountValue}`}
                </p>
                <p className="text-white">
                  <strong>Redemptions:</strong> {coupon.redemptions.length} /{" "}
                  {coupon.redemptionLimit}
                </p>
                <p className="text-white">
                  <strong>Valid From:</strong>{" "}
                  {new Date(coupon.validFrom).toLocaleDateString()}
                </p>
                <p className="text-white">
                  <strong>Valid To:</strong>{" "}
                  {coupon.validUntil
                    ? new Date(coupon.validUntil).toLocaleDateString()
                    : "No Expiry"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
