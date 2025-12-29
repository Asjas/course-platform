import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { courseReview, supportTicket } from "~/db/schema/index.js";

export type AllReviews = Awaited<ReturnType<typeof getAllReviews>>;
export type ReviewById = Awaited<ReturnType<typeof getReviewById>>;
export type UserReviewForCourse = Awaited<
  ReturnType<typeof getUserReviewForCourse>
>;
export type AdminUsers = Awaited<ReturnType<typeof getAdminUsers>>;

const preparedGetAllReviewsStatement = db.query.courseReview
  .findMany({
    with: {
      user: true,
      course: true,
    },
    orderBy: (reviews) => [desc(reviews.createdAt)],
  })
  .prepare("getAllReviews");

export async function getAllReviews() {
  const reviews = await preparedGetAllReviewsStatement.execute();
  return reviews;
}

export async function getReviewById({ reviewId }: { reviewId: string }) {
  const review = await db.query.courseReview.findFirst({
    where: (reviews) => eq(reviews.id, reviewId),
    with: {
      user: true,
      course: {
        with: {
          progress: {
            where: (progress, { eq }) =>
              eq(progress.userId, sql`${courseReview.userId}`.mapWith(String)),
          },
        },
      },
    },
  });

  if (!review) {
    return null;
  }

  // Get user's course progress
  const courseProgress = await db.query.courseProgress.findFirst({
    where: (progress) =>
      and(
        eq(progress.userId, review.userId),
        eq(progress.courseId, review.courseId),
      ),
  });

  // Get count of open support tickets for this user
  const openTicketsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(supportTicket)
    .where(
      and(
        eq(supportTicket.userId, review.userId),
        sql`${supportTicket.status} IN ('open', 'in_progress')`,
      ),
    )
    .then((result) => Number(result[0]?.count || 0));

  return {
    ...review,
    courseProgress,
    openTicketsCount,
  };
}

export async function getUserReviewForCourse({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) {
  const review = await db.query.courseReview.findFirst({
    where: (reviews) =>
      and(eq(reviews.userId, userId), eq(reviews.courseId, courseId)),
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

export async function getAdminUsers() {
  const admins = await db.query.user.findMany({
    where: (users) => eq(users.role, "admin"),
    columns: {
      id: true,
      name: true,
      email: true,
    },
  });

  return admins;
}
