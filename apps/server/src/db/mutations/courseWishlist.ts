import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import { courseWishlist } from "~/db/schema/index.js";

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
