import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { courseReview } from "~/db/schema/index.js";

export async function updateReview({
  reviewId,
  updates,
}: {
  reviewId: string;
  updates: {
    title?: string;
    comment?: string;
    approved?: boolean;
    reviewedAt?: Date | null;
  };
}) {
  const [review] = await db
    .update(courseReview)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(courseReview.id, reviewId))
    .returning();

  return review;
}

export async function deleteReview({ reviewId }: { reviewId: string }) {
  const [review] = await db
    .delete(courseReview)
    .where(eq(courseReview.id, reviewId))
    .returning();

  return review;
}

export async function approveReview({ reviewId }: { reviewId: string }) {
  const [review] = await db
    .update(courseReview)
    .set({
      approved: true,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(courseReview.id, reviewId))
    .returning();

  return review;
}
