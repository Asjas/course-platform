/**
 * Reviews Hooks
 *
 * React hooks for accessing the reviews collection.
 */
import { ReviewsCollection } from "./reviews.collection";
import { eq, useLiveQuery } from "@tanstack/react-db";

/**
 * Get all reviews.
 * Uses the offline-first collection.
 */
export function useReviews() {
  return useLiveQuery(ReviewsCollection);
}

/**
 * Get a single review by ID.
 * Returns the review from the offline collection.
 */
export function useReviewById({ reviewId }: { reviewId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ review: ReviewsCollection })
        .where(({ review }) => eq(review.id, reviewId))
        .findOne();
    },
    [reviewId],
  );
}
