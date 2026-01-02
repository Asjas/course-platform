import { TRPCError } from "@trpc/server";
import { ulid } from "ulid";
import * as z from "zod";
import { courseReview } from "~/db/schema/index.js";
import { notifyAdminNewReview } from "~/lib/notifications.js";
import {
  type EntitySyncUpdate,
  createSyncUpdate,
  getEntityUpdatesSince,
  publishEntityChange,
  reviewsSyncConfig,
  streamEntityUpdates,
} from "~/lib/sse-sync.js";
import { isAdmin, isAuthenticated, publicProcedure, router } from "~/router.js";
import { insertUserNotification } from "~/routers/notifications/mutations.js";
import {
  approveReview,
  createAdminReview,
  createReview,
  deleteReview,
  getReviewWithCourse,
  updateReview,
} from "~/routers/reviews/mutations.js";
import {
  type AllReviews,
  type ReviewById,
  type UserReviewForCourse,
  getAdminUsers,
  getAllReviews,
  getReviewById,
  getUserReviewForCourse,
} from "~/routers/reviews/queries.js";

type Review = typeof courseReview.$inferSelect;

export type ReviewSyncUpdate = EntitySyncUpdate<Review>;

export const reviewsRouter = router({
  // Create a new review (authenticated users only)
  createReview: publicProcedure
    .input(
      z.object({
        courseId: z.string(),
        rating: z.number().min(1).max(5),
        title: z.string().min(1).max(100),
        comment: z.string().max(2000),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }) => {
      const { courseId, rating, title, comment } = input;
      const userId = ctx.user.id;
      const fastify = ctx.reply.server;

      const [err, review] = await fastify.to(
        createReview({ userId, courseId, rating, title, comment }),
      );

      if (err) {
        fastify.log.error(err);

        // Check for unique constraint violation (user already reviewed this course)
        const errorCode = (err as { code?: string }).code;
        if (err.message?.includes("unique") || errorCode === "23505") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You have already reviewed this course",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create review",
        });
      }

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          reviewsSyncConfig,
          createSyncUpdate("created", review.id, review, userId),
        );
      } catch (sseErr) {
        fastify.log.error(sseErr, "Failed to publish review to SSE");
      }

      // Send notification to admins after review is created
      try {
        const [reviewWithCourseErr, reviewWithCourse] = await fastify.to(
          getReviewWithCourse({ reviewId: review.id }),
        );

        if (!reviewWithCourseErr && reviewWithCourse) {
          await notifyAdminNewReview({
            courseName: reviewWithCourse.course.name,
            reviewerName: ctx.user.name,
            reviewId: review.id,
          });
        }
      } catch (notificationErr) {
        // Log but don't fail the request - the review was created successfully
        fastify.log.error(
          notificationErr,
          "Failed to send admin notification for new review",
        );
      }

      return review;
    }),

  // Get all reviews (admin only)
  getAllReviews: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<AllReviews> => {
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

  // Create a review as admin (for external social media reviews)
  createAdminReview: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        courseId: z.string(),
        rating: z.number().min(1).max(5).nullable(),
        title: z.string().min(1).max(100),
        comment: z.string().max(2000),
        externalLink: z.string().url().nullable(),
        approved: z.boolean(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const {
        userId,
        courseId,
        rating,
        title,
        comment,
        externalLink,
        approved,
      } = input;
      const fastify = ctx.reply.server;

      const [err, review] = await fastify.to(
        createAdminReview({
          userId,
          courseId,
          rating,
          title,
          comment,
          externalLink,
          approved,
        }),
      );

      if (err) {
        fastify.log.error(err);

        // Check for unique constraint violation (user already reviewed this course)
        const errorCode = (err as { code?: string }).code;
        if (err.message?.includes("unique") || errorCode === "23505") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This user has already reviewed this course",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create review",
        });
      }

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          reviewsSyncConfig,
          createSyncUpdate("created", review.id, review, ctx.user.id),
        );
      } catch (sseErr) {
        fastify.log.error(sseErr, "Failed to publish admin review to SSE");
      }

      return review;
    }),

  // Get single review by ID with extended details (admin only)
  getReviewById: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .use(isAdmin)
    .query(async ({ ctx, input }): Promise<NonNullable<ReviewById>> => {
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
        rating: z.number().min(1).max(5).nullable().optional(),
        title: z.string().optional(),
        comment: z.string().optional(),
        externalLink: z.string().url().nullable().optional(),
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

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          reviewsSyncConfig,
          createSyncUpdate("updated", reviewId, review, ctx.user.id),
        );
      } catch (sseErr) {
        fastify.log.error(sseErr, "Failed to publish review update to SSE");
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

      // First get the review with course info for the notification
      const [fetchErr, reviewWithCourse] = await fastify.to(
        getReviewWithCourse({ reviewId }),
      );

      if (fetchErr || !reviewWithCourse) {
        fastify.log.error(fetchErr || "Review not found");
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      const [err, review] = await fastify.to(approveReview({ reviewId }));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      // Send notification to the user
      const [notificationErr] = await fastify.to(
        insertUserNotification({
          newNotification: {
            id: ulid(),
            userId: reviewWithCourse.userId,
            type: "review_approved",
            title: "Review Approved",
            message: `Your review for "${reviewWithCourse.course.name}" has been approved and is now visible to others.`,
            link: `/courses/${reviewWithCourse.course.slug}`,
          },
        }),
      );

      if (notificationErr) {
        // Log but don't fail the request - the review was approved successfully
        fastify.log.error(
          notificationErr,
          "Failed to send review approval notification",
        );
      }

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          reviewsSyncConfig,
          createSyncUpdate("updated", reviewId, review, ctx.user.id),
        );
      } catch (sseErr) {
        fastify.log.error(sseErr, "Failed to publish review approval to SSE");
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

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          reviewsSyncConfig,
          createSyncUpdate("deleted", reviewId, null, ctx.user.id),
        );
      } catch (sseErr) {
        fastify.log.error(sseErr, "Failed to publish review deletion to SSE");
      }

      return review;
    }),

  // Get user's own review for a course (authenticated users)
  getUserReviewForCourse: publicProcedure
    .input(
      z.object({
        courseId: z.string(),
      }),
    )
    .use(isAuthenticated)
    .query(async ({ ctx, input }): Promise<UserReviewForCourse> => {
      const { courseId } = input;
      const userId = ctx.user.id;
      const fastify = ctx.reply.server;

      const [err, review] = await fastify.to(
        getUserReviewForCourse({ userId, courseId }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get review",
        });
      }

      return review;
    }),

  // Update user's own review (authenticated users)
  // This resets approval status and notifies admins
  updateUserReview: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
        rating: z.number().min(1).max(5),
        title: z.string().min(1).max(100),
        comment: z.string().max(2000),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }) => {
      const { reviewId, rating, title, comment } = input;
      const userId = ctx.user.id;
      const fastify = ctx.reply.server;

      // First get the review to verify ownership and get course info
      const [fetchErr, existingReview] = await fastify.to(
        getReviewWithCourse({ reviewId }),
      );

      if (fetchErr || !existingReview) {
        fastify.log.error(fetchErr || "Review not found");
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      // Verify the user owns this review
      if (existingReview.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own reviews",
        });
      }

      // Update the review and reset approval status
      const [err, review] = await fastify.to(
        updateReview({
          reviewId,
          updates: {
            rating,
            title,
            comment,
            approved: false,
            reviewedAt: null,
          },
        }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update review",
        });
      }

      // Notify all admin users about the updated review
      const [adminErr, admins] = await fastify.to(getAdminUsers());

      if (adminErr) {
        fastify.log.error(
          adminErr,
          "Failed to get admin users for notification",
        );
      } else if (admins && admins.length > 0) {
        // Send notification to each admin
        const notificationPromises = admins.map((admin) =>
          insertUserNotification({
            newNotification: {
              id: ulid(),
              userId: admin.id,
              type: "general",
              title: "Review Updated - Needs Approval",
              message: `${ctx.user.name} has updated their review for "${existingReview.course.name}" and it requires re-approval.`,
              link: "/admin/reviews",
              actorId: userId,
            },
          }),
        );

        const notificationResults =
          await Promise.allSettled(notificationPromises);
        const failures = notificationResults.filter(
          (r) => r.status === "rejected",
        );
        if (failures.length > 0) {
          fastify.log.error(
            { failures },
            "Some admin notifications failed to send",
          );
        }
      }

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          reviewsSyncConfig,
          createSyncUpdate("updated", reviewId, review, userId),
        );
      } catch (sseErr) {
        fastify.log.error(
          sseErr,
          "Failed to publish user review update to SSE",
        );
      }

      return review;
    }),

  // Delete user's own review (authenticated users)
  deleteUserReview: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }) => {
      const { reviewId } = input;
      const userId = ctx.user.id;
      const fastify = ctx.reply.server;

      // First get the review to verify ownership
      const [fetchErr, existingReview] = await fastify.to(
        getReviewWithCourse({ reviewId }),
      );

      if (fetchErr || !existingReview) {
        fastify.log.error(fetchErr || "Review not found");
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      // Verify the user owns this review
      if (existingReview.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own reviews",
        });
      }

      const [err, review] = await fastify.to(deleteReview({ reviewId }));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete review",
        });
      }

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          reviewsSyncConfig,
          createSyncUpdate("deleted", reviewId, null, userId),
        );
      } catch (sseErr) {
        fastify.log.error(
          sseErr,
          "Failed to publish user review deletion to SSE",
        );
      }

      return review;
    }),

  /**
   * Subscribe to real-time review updates via SSE.
   * Clients receive updates when reviews are created, updated, or deleted.
   */
  subscribeToUpdates: publicProcedure
    .input(
      z.object({
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAuthenticated)
    .subscription(async function* ({ input }) {
      yield* streamEntityUpdates<Review>(reviewsSyncConfig, input.lastEventId);
    }),

  /**
   * Get review updates since a specific timestamp.
   * Useful for syncing offline clients that have been disconnected.
   */
  getUpdatesSince: publicProcedure
    .input(
      z.object({
        since: z.number(), // Timestamp in ms
      }),
    )
    .use(isAuthenticated)
    .query(async ({ input }) => {
      try {
        const updates = await getEntityUpdatesSince<Review>(
          reviewsSyncConfig,
          input.since,
        );
        return updates;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch review updates",
        });
      }
    }),
});
