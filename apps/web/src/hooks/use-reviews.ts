import { eq, useLiveQuery } from "@tanstack/react-db";
import { ReviewsCollection } from "~/collections/reviews";

export function useReviews() {
  return useLiveQuery(ReviewsCollection);
}

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
