import { relations, sql } from "drizzle-orm";
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
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { enrollment } from "~/db/schema/enrollment.js";
import { courseProgress, lessonProgress } from "~/db/schema/progress.js";
import { user } from "~/db/schema/user.js";

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

export const videoProvider = mySchema.enum("video_provider", ["youtube"]);

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
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("course_module_slug").on(table.slug),
    index("course_module_course_idx").on(table.courseId),
    check("course_module_order_check", sql`${table.order} >= 0`),
  ],
);

export const courseLesson = mySchema.table(
  "course_lesson",
  {
    id: text().primaryKey(),
    title: text().notNull(),
    slug: text().notNull(),
    videoUrl: text().notNull(),
    videoProvider: videoProvider().default("youtube").notNull(),
    content: jsonb().notNull(),
    transcription: jsonb().notNull(),
    duration: integer(),
    order: integer().notNull(),
    isPreview: boolean().default(false).notNull(),
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

export const courseFaq = mySchema.table(
  "course_faq",
  {
    id: text().primaryKey(),
    question: text().notNull(),
    answer: text().notNull(),
    order: integer().notNull(),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("course_faq_course_idx").on(table.courseId),
    check("course_faq_question_check", sql`${table.question} <> ''`),
    check("course_faq_answer_check", sql`${table.answer} <> ''`),
    check("course_faq_order_check", sql`${table.order} >= 0`),
  ],
);

// Relations
export const courseRelations = relations(course, ({ many }) => ({
  enrollments: many(enrollment, { relationName: "enrollment_course" }),
  wishlists: many(courseWishlist, { relationName: "course_wishlist_course" }),
  modules: many(courseModule, { relationName: "course_module_course" }),
  progress: many(courseProgress, { relationName: "course_progress_course" }),
  lessons: many(courseLesson, { relationName: "course_lesson_course" }),
  reviews: many(courseReview, { relationName: "course_review_course" }),
  certificates: many(courseCompletionCertificate, {
    relationName: "course_completion_certificate_course",
  }),
  instructorNotes: many(courseInstructorNote, {
    relationName: "course_instructor_note_course",
  }),
  faq: many(courseFaq, { relationName: "course_faq_course" }),
}));

export const courseModuleRelations = relations(
  courseModule,
  ({ one, many }) => ({
    course: one(course, {
      fields: [courseModule.courseId],
      references: [course.id],
      relationName: "course_module_course",
    }),
    lessons: many(courseLesson),
  }),
);

export const courseLessonRelations = relations(courseLesson, ({ one }) => ({
  module: one(courseModule, {
    fields: [courseLesson.moduleId],
    references: [courseModule.id],
    relationName: "course_lesson_module",
  }),
  course: one(course, {
    fields: [courseLesson.courseId],
    references: [course.id],
    relationName: "course_lesson_course",
  }),
  progress: one(lessonProgress, {
    fields: [courseLesson.id],
    references: [lessonProgress.lessonId],
    relationName: "lesson_progress_lesson",
  }),
}));

export const courseReviewRelations = relations(courseReview, ({ one }) => ({
  course: one(course, {
    fields: [courseReview.courseId],
    references: [course.id],
    relationName: "course_review_course",
  }),
  user: one(user, {
    fields: [courseReview.userId],
    references: [user.id],
    relationName: "course_review_user",
  }),
}));

export const courseWishlistRelations = relations(courseWishlist, ({ one }) => ({
  course: one(course, {
    fields: [courseWishlist.courseId],
    references: [course.id],
    relationName: "course_wishlist_course",
  }),
  user: one(user, {
    fields: [courseWishlist.userId],
    references: [user.id],
    relationName: "course_wishlist_user",
  }),
}));

export const courseCompletionCertificateRelations = relations(
  courseCompletionCertificate,
  ({ one }) => ({
    course: one(course, {
      fields: [courseCompletionCertificate.courseId],
      references: [course.id],
      relationName: "course_completion_certificate_course",
    }),
    user: one(user, {
      fields: [courseCompletionCertificate.userId],
      references: [user.id],
      relationName: "course_completion_certificate_user",
    }),
  }),
);

export const courseInstructorNoteRelations = relations(
  courseInstructorNote,
  ({ one }) => ({
    course: one(course, {
      fields: [courseInstructorNote.courseId],
      references: [course.id],
      relationName: "course_instructor_note_course",
    }),
    instructor: one(user, {
      fields: [courseInstructorNote.instructorId],
      references: [user.id],
      relationName: "course_instructor_note_instructor",
    }),
  }),
);

export const courseFaqRelations = relations(courseFaq, ({ one }) => ({
  course: one(course, {
    fields: [courseFaq.courseId],
    references: [course.id],
    relationName: "course_faq_course",
  }),
}));
