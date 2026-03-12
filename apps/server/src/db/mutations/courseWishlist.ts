import { eq } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import {
  courseWishlist,
  courseWishlistVerificationToken,
} from "~/db/schema/index.js";

const COURSE_WISHLIST_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface CreateCourseWishlistInput {
  email: string;
  name?: string;
  courseId: string;
  userId?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export async function createCourseWishlistEntry(
  input: CreateCourseWishlistInput,
) {
  const id = `cwl:${ulid()}`;

  const [result] = await db
    .insert(courseWishlist)
    .values({
      id,
      email: input.email.toLowerCase(),
      name: input.name,
      courseId: input.courseId,
      userId: input.userId,
      referrer: input.referrer,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
    })
    .returning();

  if (!result) {
    throw new Error("Failed to create course wishlist entry");
  }

  return result;
}

export async function confirmCourseWishlistEntry(id: string) {
  const [result] = await db
    .update(courseWishlist)
    .set({ confirmedAt: new Date() })
    .where(eq(courseWishlist.id, id))
    .returning();

  return result;
}

export async function unsubscribeCourseWishlistEntry(id: string) {
  const [result] = await db
    .update(courseWishlist)
    .set({ unsubscribedAt: new Date() })
    .where(eq(courseWishlist.id, id))
    .returning();

  return result;
}

export async function createCourseWishlistVerificationToken(
  wishlistId: string,
) {
  const id = `cwvt:${ulid()}`;
  const token = `${ulid()}${randomBytes(16).toString("hex")}`;
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + COURSE_WISHLIST_TOKEN_TTL_MS);

  const [result] = await db
    .insert(courseWishlistVerificationToken)
    .values({
      id,
      wishlistId,
      tokenHash,
      expiresAt,
    })
    .returning();

  if (!result) {
    throw new Error("Failed to create course wishlist verification token");
  }

  return {
    token,
    expiresAt,
    id: result.id,
  };
}

export async function markCourseWishlistVerificationTokenUsed(id: string) {
  const [result] = await db
    .update(courseWishlistVerificationToken)
    .set({ usedAt: new Date() })
    .where(eq(courseWishlistVerificationToken.id, id))
    .returning();

  return result;
}
