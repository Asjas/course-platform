import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
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
    return <div>Loading...</div>;
  }

  //   const coupons: {
  //     id: string;
  //     createdAt: string;
  //     updatedAt: string;
  //     description: string | null;
  //     active: boolean;
  //     courseId: string | null;
  //     code: string;
  //     discountType: "fixed" | "percentage";
  //     discountValue: number;
  //     redemptionLimit: number;
  //     validFrom: string;
  //     validUntil: string | null;
  //     createdBy: string | null;
  //     redemptions: {
  //         id: string;
  //         userId: string;
  //         createdAt: string;
  //         updatedAt: string;
  //         courseId: string;
  //         couponId: string;
  //         redeemedAt: string;
  //     }[];
  // }[] | undefined

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
      <div className="flex flex-col gap-4">
        {coupons?.map((coupon) => (
          <div
            className="flex rounded-md border border-gray-200 px-2 py-2"
            key={coupon.id}
          >
            <div className="flex-1">
              <p>
                <strong>Code:</strong>{" "}
                <span className="bg-green-600 text-white">{coupon.code}</span>
              </p>
              <p>Type: {coupon.discountType}</p>
              <p>
                Value:{" "}
                {coupon.discountType === "percentage"
                  ? `${coupon.discountValue}%`
                  : `$${coupon.discountValue}`}
              </p>
            </div>
            <div>
              <strong>Redemptions:</strong> {coupon.redemptions.length}
              <p>Redemption Limit: {coupon.redemptionLimit}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
