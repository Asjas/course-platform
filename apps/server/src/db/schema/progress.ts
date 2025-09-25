import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { course, courseLesson } from "~/db/schema/course.js";
import { mySchema, user } from "~/db/schema/user.js";

export const courseProgress = mySchema.table(
  "course_progress",
  {
    id: text().primaryKey(),
    progress: smallint().default(0).notNull(), // Progress across entire course in percentage
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
