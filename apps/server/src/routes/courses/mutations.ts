import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import { course } from "~/db/schema/course.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ routes: "db:mutations:course" });

export type Course = typeof course.$inferSelect;
export type NewCourse = Omit<typeof course.$inferInsert, "id">;

export async function insertCourse({ newCourse }: { newCourse: NewCourse }) {
  const id = `course:${ulid()}`;
  const newCourseWithId = { id, ...newCourse };

  try {
    const result = await db.insert(course).values(newCourseWithId).returning();

    return result[0];
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Failed to insert course");
    }

    throw err;
  }
}

export async function updateCourseById({
  courseId,
  updates,
}: {
  courseId: string;
  updates: Course;
}) {
  try {
    const result = await db
      .update(course)
      .set({ ...updates })
      .where(eq(course.id, courseId))
      .returning();

    return result[0];
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to update course with id ${courseId}`);
    }

    throw err;
  }
}

export async function deleteCourseById({ courseId }: { courseId: string }) {
  try {
    const result = await db
      .delete(course)
      .where(eq(course.id, courseId))
      .returning({ id: course.id });

    return result;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to delete course with id ${courseId}`);
    }

    throw err;
  }
}
