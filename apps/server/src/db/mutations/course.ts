import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { course } from "~/db/schema/course.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:coupon" });

export type Course = typeof course.$inferSelect;
export type NewCourse = typeof course.$inferInsert;

export async function insertCourse(newCourse: NewCourse) {
  try {
    const result = await db.insert(course).values(newCourse).returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert course");

    throw err;
  }
}

export async function updateCourseById(id: string, updates: Partial<Course>) {
  try {
    const result = await db
      .update(course)
      .set({ ...updates })
      .where(eq(course.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update course with id ${id}`);
    throw err;
  }
}

export async function deleteCourseById({ id }: Course) {
  try {
    const result = db
      .delete(course)
      .where(eq(course.id, id))
      .returning({ id: course.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete course with id ${id}`);
    throw err;
  }
}
