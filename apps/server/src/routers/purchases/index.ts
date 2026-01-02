import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { isAdmin, publicProcedure, router } from "~/router.js";
import { refundOrder } from "~/routers/purchases/mutations.js";
import {
  type AllPurchases,
  type PolarOrderResponse,
  getAllPurchases,
  getPurchaseById,
} from "~/routers/purchases/queries.js";

export type { AllPurchases, PolarOrderResponse };

// Valid refund reasons from Polar SDK
const refundReasonSchema = z.enum([
  "duplicate",
  "fraudulent",
  "customer_request",
  "service_disruption",
  "satisfaction_guarantee",
  "dispute_prevention",
  "other",
]);

export const purchasesRouter = router({
  getAll: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<AllPurchases> => {
      try {
        const purchases = await getAllPurchases();

        ctx.request.log.debug(
          `Retrieved ${purchases.length} purchases from Polar`,
        );

        return purchases;
      } catch (err) {
        ctx.request.log.error(err, "Failed to fetch purchases from Polar");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch purchases",
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .use(isAdmin)
    .query(
      async ({
        ctx,
        input: { orderId },
      }): Promise<PolarOrderResponse | null> => {
        try {
          const purchase = await getPurchaseById(orderId);

          if (!purchase) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Purchase not found",
            });
          }

          ctx.request.log.debug(`Retrieved purchase ${orderId}`);

          return purchase;
        } catch (err) {
          if (err instanceof TRPCError) throw err;

          ctx.request.log.error(err, `Failed to fetch purchase ${orderId}`);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch purchase",
          });
        }
      },
    ),

  refund: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        reason: refundReasonSchema.optional().default("customer_request"),
        comment: z.string().optional(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input: { orderId, reason, comment } }) => {
      try {
        const result = await refundOrder({ orderId, reason, comment });

        ctx.request.log.info(`Refunded order ${orderId} successfully`);

        return result;
      } catch (err) {
        ctx.request.log.error(err, `Failed to refund order ${orderId}`);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to refund order",
        });
      }
    }),
});
