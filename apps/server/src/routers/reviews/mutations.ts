import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import { courseReview } from "~/db/schema/index.js";

export async function createReview({
  userId,
  courseId,
  rating,
  title,
  comment,
}: {
  userId: string;
  courseId: string;
  rating: number;
  title: string;
  comment: string;
}) {
  const [review] = await db
    .insert(courseReview)
    .values({
      id: ulid(),
      userId,
      courseId,
      rating,
      title,
      comment,
      approved: false,
    })
    .returning();

  return review;
}

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
