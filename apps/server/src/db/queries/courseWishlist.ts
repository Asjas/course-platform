import { and, eq, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import { db } from "~/db/index.js";
import {
  courseWishlist,
  courseWishlistVerificationToken,
} from "~/db/schema/index.js";

export type CourseWishlistEntry = typeof courseWishlist.$inferSelect;
export type CourseWishlistVerificationTokenEntry =
  typeof courseWishlistVerificationToken.$inferSelect;

function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getCourseWishlistByEmailAndCourse(
  email: string,
  courseId: string,
): Promise<CourseWishlistEntry | undefined> {
  const result = await db.query.courseWishlist.findFirst({
    where: and(
      eq(courseWishlist.email, email.toLowerCase()),
      eq(courseWishlist.courseId, courseId),
    ),
  });

  return result;
}

export async function getCourseWishlistById(
  id: string,
): Promise<CourseWishlistEntry | undefined> {
  const result = await db.query.courseWishlist.findFirst({
    where: eq(courseWishlist.id, id),
  });

  return result;
}

export async function getCourseWishlistByIdAndEmail(
  id: string,
  email: string,
): Promise<CourseWishlistEntry | undefined> {
  const result = await db.query.courseWishlist.findFirst({
    where: and(
      eq(courseWishlist.id, id),
      eq(courseWishlist.email, email.toLowerCase()),
    ),
  });

  return result;
}

export async function getCourseWishlistCount(
  courseId: string,
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courseWishlist)
    .where(eq(courseWishlist.courseId, courseId));

  return result[0]?.count ?? 0;
}

export async function getCourseWishlistByUser(
  userId: string,
): Promise<CourseWishlistEntry[]> {
  const result = await db.query.courseWishlist.findMany({
    where: eq(courseWishlist.userId, userId),
  });

  return result;
}

export async function getCourseWishlistVerificationTokenByToken(
  token: string,
): Promise<CourseWishlistVerificationTokenEntry | undefined> {
  const tokenHash = hashVerificationToken(token);

  const result = await db.query.courseWishlistVerificationToken.findFirst({
    where: eq(courseWishlistVerificationToken.tokenHash, tokenHash),
  });

  return result;
}
