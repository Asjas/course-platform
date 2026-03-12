import { desc, eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { courseWishlist } from "~/db/schema/course.js";
import { earlySignup } from "~/db/schema/earlySignup.js";

export type AllEarlySignups = Awaited<ReturnType<typeof getAllEarlySignups>>;
export type EarlySignupById = Awaited<ReturnType<typeof getEarlySignupById>>;

export interface AdminEarlySignupEntry {
  id: string;
  email: string;
  name: string | null;
  source: string;
  referrer: string | null;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sourceTable: "early_signup" | "course_wishlist";
}

const preparedGetAllLegacyEarlySignups = db.query.earlySignup
  .findMany({
    orderBy: (row) => [desc(row.createdAt)],
  })
  .prepare("getAllLegacyEarlySignups");

const preparedGetAllCourseWishlistSignups = db.query.courseWishlist
  .findMany({
    orderBy: (row) => [desc(row.createdAt)],
  })
  .prepare("getAllCourseWishlistSignups");

const preparedGetLegacyEarlySignupById = db.query.earlySignup
  .findFirst({
    where: (row) => eq(row.id, sql.placeholder("legacyId")),
  })
  .prepare("getLegacyEarlySignupById");

const preparedGetCourseWishlistSignupById = db.query.courseWishlist
  .findFirst({
    where: (row) => eq(row.id, sql.placeholder("wishlistId")),
  })
  .prepare("getCourseWishlistSignupById");

function toLegacyAdminEntry(
  record: typeof earlySignup.$inferSelect,
): AdminEarlySignupEntry {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    source: record.source,
    referrer: record.referrer,
    confirmedAt: record.confirmedAt,
    unsubscribedAt: record.unsubscribedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    sourceTable: "early_signup",
  };
}

function toCourseWishlistAdminEntry(
  record: typeof courseWishlist.$inferSelect,
): AdminEarlySignupEntry {
  return {
    id: record.id,
    email: record.email ?? "",
    name: record.name,
    source: record.utmSource ?? "course-wishlist",
    referrer: record.referrer,
    confirmedAt: record.confirmedAt,
    unsubscribedAt: record.unsubscribedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    sourceTable: "course_wishlist",
  };
}

export async function getAllEarlySignups() {
  const [legacy, wishlist] = await Promise.all([
    preparedGetAllLegacyEarlySignups.execute(),
    preparedGetAllCourseWishlistSignups.execute(),
  ]);

  const merged = [
    ...legacy.map(toLegacyAdminEntry),
    ...wishlist
      .filter((entry) => Boolean(entry.email))
      .map(toCourseWishlistAdminEntry),
  ];

  return merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getEarlySignupById({ id }: { id: string }) {
  const [legacy, wishlist] = await Promise.all([
    preparedGetLegacyEarlySignupById.execute({ legacyId: id }),
    preparedGetCourseWishlistSignupById.execute({ wishlistId: id }),
  ]);

  if (legacy) {
    return toLegacyAdminEntry(legacy);
  }

  if (wishlist && wishlist.email) {
    return toCourseWishlistAdminEntry(wishlist);
  }

  return null;
}
