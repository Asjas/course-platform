/**
 * Reviews Collection
 *
 * Offline-first collection for course reviews.
 * Supports full CRUD operations.
 */
import type { AllReviews } from "@apps/server/src/routers/reviews/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type Review = AllReviews[number];

/**
 * Reviews collection with full CRUD operations.
 */
export const ReviewsCollection = createCollection(
  queryCollectionOptions<Review>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.reviews.getAll.queryKey(),
    queryFn: () => trpcClient.reviews.getAll.query(),
    onInsert: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        // User reviews always require a rating (admin reviews use createAdminReview)
        if (modified.rating === null) {
          throw new Error("Rating is required for user reviews");
        }

        await trpcClient.reviews.createReview.mutate({
          courseId: modified.courseId,
          rating: modified.rating,
          title: modified.title,
          comment: modified.comment,
        });
      } catch (error) {
        console.error("Error inserting review: ", error);
        throw error;
      }
    },
    onUpdate: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.reviews.updateReview.mutate({
          reviewId: modified.id,
          rating: modified.rating ?? undefined,
          title: modified.title,
          comment: modified.comment,
          externalLink: modified.externalLink,
          approved: modified.approved,
          reviewedAt: modified.reviewedAt
            ? new Date(modified.reviewedAt)
            : null,
        });
      } catch (error) {
        console.error("Error updating review: ", error);
        toast.error(
          "An error occurred while updating the review. Please try again.",
        );
        throw error;
      }
    },
    onDelete: async ({ transaction }) => {
      try {
        const { original } = transaction.mutations[0];

        await trpcClient.reviews.deleteReview.mutate({
          reviewId: original.id,
        });
      } catch (error) {
        console.error("Error deleting review: ", error);
        toast.error(
          "An error occurred while deleting the review. Please try again.",
        );
        throw error;
      }
    },
  }),
);
