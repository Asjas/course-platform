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

export async function createAdminReview({
  userId,
  courseId,
  rating,
  title,
  comment,
  externalLink,
  approved,
}: {
  userId: string;
  courseId: string;
  rating: number | null;
  title: string;
  comment: string;
  externalLink: string | null;
  approved: boolean;
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
      externalLink,
      approved,
      reviewedAt: approved ? new Date() : null,
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
    rating?: number | null;
    title?: string;
    comment?: string;
    externalLink?: string | null;
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

export async function getReviewWithCourse({ reviewId }: { reviewId: string }) {
  const review = await db.query.courseReview.findFirst({
    where: eq(courseReview.id, reviewId),
    with: {
      course: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return review;
}
