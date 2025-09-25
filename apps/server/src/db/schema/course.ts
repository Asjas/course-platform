import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { mySchema, user } from "~/db/schema/user.js";

export const seatStatus = mySchema.enum("seat_status", [
  "pending",
  "claimed",
  "revoked",
]);

export const courseLevel = mySchema.enum("course_level", [
  "All levels",
  "Beginner",
  "Intermediate",
  "Advanced",
]);

export const courseAccess = mySchema.enum("course_access", [
  "public",
  "private",
  "unlisted",
]);

export const course = mySchema.table(
  "course",
  {
    id: text().primaryKey(),
    slug: text().notNull(),
    name: text().notNull(),
    description: text(),
    level: courseLevel().default("All levels"),
    thumbnailUrl: text(),
    published: boolean().default(false).notNull(),
    isFree: boolean().default(false).notNull(),
    price: smallint().default(19).notNull(),
    priceCurrency: text().default("USD").notNull(),
    isSaleActive: boolean().default(false).notNull(),
    salePrice: smallint().default(0).notNull(),
    saleStartAt: timestamp({ withTimezone: true }),
    saleExpiresAt: timestamp({ withTimezone: true }),
    totalEnrollments: integer().default(0).notNull(),
    averageRating: numeric({ precision: 2, scale: 1 }).default("0.0").notNull(),
    totalReviews: integer().default(0).notNull(),
    totalModules: integer().default(0).notNull(),
    totalLessons: integer().default(0).notNull(),
    totalDuration: integer().default(0).notNull(),
    trialModuleLimit: smallint().default(0).notNull(),
    authorId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("course_slug_idx").on(table.slug),
    check("course_price_non_negative", sql`${table.price} >= 0`),
    check("course_sale_price_non_negative", sql`${table.salePrice} >= 0`),
    check(
      "course_sale_price_not_greater",
      sql`${table.salePrice} <= ${table.price}`,
    ),
    check(
      "course_sale_dates_check",
      sql`${table.saleStartAt} IS NULL OR ${table.saleExpiresAt} IS NULL OR ${table.saleExpiresAt} > ${table.saleStartAt}`,
    ),
    check(
      "course_total_enrollments_check",
      sql`${table.totalEnrollments} >= 0`,
    ),
    check("course_average_rating_check", sql`${table.averageRating} >= 0`),
    check("course_average_rating_max_check", sql`${table.averageRating} <= 5`),
    check("course_total_reviews_check", sql`${table.totalReviews} >= 0`),
    check("course_total_modules_check", sql`${table.totalModules} >= 0`),
    check("course_total_lessons_check", sql`${table.totalLessons} >= 0`),
    check("course_total_duration_check", sql`${table.totalDuration} >= 0`),
    check(
      "course_trial_module_limit_check",
      sql`${table.trialModuleLimit} >= 0`,
    ),
    check(
      "course_trial_module_limit_max_check",
      sql`${table.trialModuleLimit} <= ${table.totalModules}`,
    ),
  ],
);

export const courseModule = mySchema.table(
  "course_module",
  {
    id: text().primaryKey(),
    title: text().notNull(),
    slug: text().notNull(),
    description: text().notNull(),
    order: integer().notNull(),
    isPreview: boolean().default(false).notNull(),
    courseSlug: text()
      .notNull()
      .references(() => course.slug, { onDelete: "cascade" }),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("course_module_slug").on(table.slug),
    index("course_module_course_idx").on(table.courseId),
    index("course_module_course_slug_idx").on(table.courseSlug),
    check("course_module_order_check", sql`${table.order} >= 0`),
  ],
);

export const courseLesson = mySchema.table(
  "course_lesson",
  {
    id: text().primaryKey(),
    title: text().notNull(),
    content: jsonb().notNull(),
    transcription: jsonb(),
    duration: integer(),
    order: integer().notNull(),
    isPreview: boolean().default(false).notNull(),
    moduleSlug: text()
      .notNull()
      .references(() => courseModule.slug, { onDelete: "cascade" }),
    courseSlug: text()
      .notNull()
      .references(() => course.slug, { onDelete: "cascade" }),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    moduleId: text()
      .notNull()
      .references(() => courseModule.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("course_lesson_module_idx").on(table.moduleId),
    index("course_lesson_course_idx").on(table.courseId),
    index("course_lesson_module_slug_idx").on(table.moduleSlug),
    index("course_lesson_course_slug_idx").on(table.courseSlug),
  ],
);

export const courseReview = mySchema.table(
  "course_review",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    rating: smallint().notNull(),
    title: text().notNull(),
    comment: text().notNull(),
    approved: boolean().default(false).notNull(),
    reviewedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("course_review_unique_idx").on(table.userId, table.courseId),
    index("course_review_user_idx").on(table.userId),
    index("course_review_course_idx").on(table.courseId),
    check(
      "course_review_rating_check",
      sql`${table.rating} >= 1 AND ${table.rating} <= 5`,
    ),
    check(
      "course_review_approval_check",
      sql`${table.approved} IN (true, false)`,
    ),
    check(
      "course_review_reviewed_at_check",
      sql`${table.approved} = true OR (${table.approved} = false AND ${table.reviewedAt} IS NULL)`,
    ),
  ],
);

export const courseWishlist = mySchema.table(
  "course_wishlist",
  {
    id: text().primaryKey(),
    userId: text().references(() => user.id, { onDelete: "cascade" }),
    email: text(),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("course_wishlist_email_idx").on(table.email),
    uniqueIndex("course_wishlist_unique_idx").on(table.userId, table.courseId),
    index("course_wishlist_user_idx").on(table.userId),
    index("course_wishlist_course_idx").on(table.courseId),
  ],
);

export const courseCompletionCertificate = mySchema.table(
  "course_completion_certificate",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    issuedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    certificateUrl: text().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("course_certificate_unique_idx").on(
      table.userId,
      table.courseId,
    ),
    index("course_certificate_user_idx").on(table.userId),
    check("course_certificate_url_check", sql`${table.certificateUrl} <> ''`),
    check(
      "course_certificate_user_check",
      sql`${table.userId} IS NULL OR ${table.userId} IN (SELECT id FROM users)`,
    ),
    check(
      "course_certificate_course_check",
      sql`${table.courseId} IS NULL OR ${table.courseId} IN (SELECT id FROM course)`,
    ),
    check(
      "course_certificate_url_format_check",
      sql`${table.certificateUrl} LIKE 'https://%'`,
    ),
  ],
);

export const courseInstructorNote = mySchema.table(
  "course_instructor_note",
  {
    id: text().primaryKey(),
    note: text().notNull(),
    instructorId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("course_instructor_note_unique_idx").on(
      table.instructorId,
      table.courseId,
    ),
    index("course_instructor_note_instructor_idx").on(table.instructorId),
    index("course_instructor_note_course_idx").on(table.courseId),
    check("course_instructor_note_check", sql`${table.note} <> ''`),
  ],
);

export const courseAnnouncement = mySchema.table(
  "course_announcement",
  {
    id: text().primaryKey(),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    title: text().notNull(),
    message: text().notNull(),
    pinned: boolean().default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    index("course_announcement_course_idx").on(table.courseId),
    index("course_announcement_pinned_idx").on(table.pinned),
    check(
      "course_announcement_pinned_check",
      sql`${table.pinned} IN (true, false)`,
    ),
    check("course_announcement_message_check", sql`${table.message} <> ''`),
    check("course_announcement_title_check", sql`${table.title} <> ''`),
    check(
      "course_announcement_course_check",
      sql`${table.courseId} IS NULL OR ${table.courseId} IN (SELECT id FROM course)`,
    ),
  ],
);

export const courseAnnouncementRead = mySchema.table(
  "course_announcement_read",
  {
    id: text().primaryKey(),
    announcementId: text()
      .notNull()
      .references(() => courseAnnouncement.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    readAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("course_announcement_read_unique_idx").on(
      table.announcementId,
      table.userId,
    ),
    index("course_announcement_read_announcement_idx").on(table.announcementId),
    index("course_announcement_read_user_idx").on(table.userId),
    check(
      "course_announcement_read_at_check",
      sql`${table.readAt} IS NOT NULL`,
    ),
    check(
      "course_announcement_read_user_check",
      sql`${table.userId} IS NULL OR ${table.userId} IN (SELECT id FROM users)`,
    ),
    check(
      "course_announcement_read_announcement_check",
      sql`${table.announcementId} IS NULL OR ${table.announcementId} IN (SELECT id FROM course_announcement)`,
    ),
  ],
);
