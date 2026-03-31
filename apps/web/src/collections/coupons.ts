import type { CouponsReturnType } from "@apps/server/src/routers/coupons/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { getBackendErrorMessage } from "~/lib/api-error";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type Coupon = CouponsReturnType[number];

export const CouponsCollection = createCollection(
  queryCollectionOptions<Coupon>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.coupons.getAll.queryKey(),
    queryFn: () => trpcClient.coupons.getAll.query(),
    onInsert: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        return await trpcClient.coupons.insertCoupon.mutate(modified);
      } catch (error) {
        console.error("Error inserting coupon: ", error);
        toast.error(
          getBackendErrorMessage(
            error,
            "An error occurred while creating the coupon. Please try again.",
          ),
        );
        throw error;
      }
    },
    onUpdate: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        return await trpcClient.coupons.updateCouponById.mutate({
          id: modified.id,
          active: modified.active,
          code: modified.code,
          courseId: modified.courseId,
          description: modified.description,
          discountType: modified.discountType,
          discountValue: modified.discountValue,
          maxRedemptions: modified.redemptionLimit,
          validFrom: new Date(modified.validFrom),
          validTo: modified.validUntil ? new Date(modified.validUntil) : null,
        });
      } catch (error) {
        console.error("Error updating coupon: ", error);
        toast.error(
          getBackendErrorMessage(
            error,
            "An error occurred while updating the coupon. Please try again.",
          ),
        );
        throw error;
      }
    },
    onDelete: async ({ transaction }) => {
      try {
        const { original } = transaction.mutations[0];

        await trpcClient.coupons.deleteCouponById.mutate({
          couponId: original.id,
        });
      } catch (error) {
        console.error("Error deleting coupon: ", error);
        toast.error(
          getBackendErrorMessage(
            error,
            "An error occurred while deleting the coupon. Please try again.",
          ),
        );
        throw error;
      }
    },
  }),
);
