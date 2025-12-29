import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { isAdmin, publicProcedure, router } from "~/router.js";
import {
  approveReview,
  deleteReview,
  updateReview,
} from "~/routers/reviews/mutations.js";
import { getAllReviews, getReviewById } from "~/routers/reviews/queries.js";

export const reviewsRouter = router({
  // Get all reviews (admin only)
  getAllReviews: publicProcedure.use(isAdmin).query(async ({ ctx }) => {
    const fastify = ctx.reply.server;

    const [err, reviews] = await fastify.to(getAllReviews());

    if (err) {
      fastify.log.error(err);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
    }

    return reviews;
  }),

  // Get single review by ID with extended details (admin only)
  getReviewById: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .use(isAdmin)
    .query(async ({ ctx, input }) => {
      const { reviewId } = input;
      const fastify = ctx.reply.server;

      const [err, review] = await fastify.to(getReviewById({ reviewId }));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      return review;
    }),

  // Update review (admin only)
  updateReview: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
        title: z.string().optional(),
        comment: z.string().optional(),
        approved: z.boolean().optional(),
        reviewedAt: z.date().nullable().optional(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const { reviewId, ...updates } = input;
      const fastify = ctx.reply.server;

      const [err, review] = await fastify.to(
        updateReview({ reviewId, updates }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return review;
    }),

  // Approve review (admin only)
  approveReview: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const { reviewId } = input;
      const fastify = ctx.reply.server;

      const [err, review] = await fastify.to(approveReview({ reviewId }));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return review;
    }),

  // Delete review (admin only)
  deleteReview: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const { reviewId } = input;
      const fastify = ctx.reply.server;

      const [err, review] = await fastify.to(deleteReview({ reviewId }));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return review;
    }),
});
