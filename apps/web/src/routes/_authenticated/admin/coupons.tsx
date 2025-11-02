import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { trpc } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
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
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1>Coupons</h1>
        <Link
          className="button"
          to="/admin/coupons/create"
        >
          Create New Coupon
        </Link>
      </div>
      <ul>
        {coupons?.map((coupon) => (
          <li key={coupon.id}>
            <strong>Code:</strong> {coupon.code} | <strong>Type:</strong>{" "}
            {coupon.discountType} | <strong>Value:</strong>{" "}
            {coupon.discountValue} | <strong>Redemptions:</strong>{" "}
            {coupon.redemptions.length}
          </li>
        ))}
      </ul>
    </div>
  );
}
