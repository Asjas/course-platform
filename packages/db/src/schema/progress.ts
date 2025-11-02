import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { mySchema } from "~/my-schema.js";
import { timestamps } from "~/schema/columns.helpers.js";
import { course, courseLesson } from "~/schema/course.js";
import { user } from "~/schema/user.js";

// Tables
export const courseProgress = mySchema.table(
  "course_progress",
  {
    id: text().primaryKey(),
    progress: smallint().default(0).notNull(),
    completed: boolean().default(false).notNull(),
    startedAt: timestamp({ withTimezone: true }),
    completedAt: timestamp({ withTimezone: true }),
    lastAccessedAt: timestamp({ withTimezone: true }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("course_progress_unique_idx").on(table.userId, table.courseId),
    index("course_progress_user_idx").on(table.userId),
    index("course_progress_course_idx").on(table.courseId),
    check(
      "course_progress_check",
      sql`${table.progress} >= 0 AND ${table.progress} <= 100`,
    ),
    check(
      "course_progress_completed_check",
      sql`${table.completed} IN (true, false)`,
    ),
    check(
      "course_progress_consistency_check",
      sql`(${table.completed} = true AND ${table.progress} = 100) OR (${table.completed} = false AND ${table.progress} < 100)`,
    ),
  ],
);

export const lessonProgress = mySchema.table(
  "lesson_progress",
  {
    id: text().primaryKey(),
    completed: boolean().default(false).notNull(),
    percentComplete: smallint().default(0).notNull(),
    lastAccessedAt: timestamp({ withTimezone: true }),
    completedAt: timestamp({ withTimezone: true }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: text()
      .notNull()
      .references(() => courseLesson.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("lesson_progress_unique_idx").on(table.userId, table.lessonId),
    index("lesson_progress_user_idx").on(table.userId),
    index("lesson_progress_lesson_idx").on(table.lessonId),
    check(
      "lesson_progress_percent_complete_check",
      sql`${table.percentComplete} >= 0 AND ${table.percentComplete} <= 100`,
    ),
    check(
      "lesson_progress_completed_check",
      sql`${table.completed} IN (true, false)`,
    ),
    check(
      "lesson_progress_consistency_check",
      sql`(${table.completed} = true AND ${table.percentComplete} = 100) OR (${table.completed} = false AND ${table.percentComplete} < 100)`,
    ),
  ],
);

// Relations
export const courseProgressRelations = relations(courseProgress, ({ one }) => ({
  user: one(user, {
    fields: [courseProgress.userId],
    references: [user.id],
    relationName: "course_progress_user",
  }),
  course: one(course, {
    fields: [courseProgress.courseId],
    references: [course.id],
    relationName: "course_progress_course",
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(user, {
    fields: [lessonProgress.userId],
    references: [user.id],
    relationName: "lesson_progress_user",
  }),
  lesson: one(courseLesson, {
    fields: [lessonProgress.lessonId],
    references: [courseLesson.id],
    relationName: "lesson_progress_lesson",
  }),
}));
