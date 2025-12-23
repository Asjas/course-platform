import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import { course, courseLesson, courseModule } from "~/db/schema/course.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "routers:courses:mutations" });

// Course types
export type Course = typeof course.$inferSelect;
export type NewCourse = Omit<typeof course.$inferInsert, "id">;

// Module types
export type CourseModule = typeof courseModule.$inferSelect;
export type NewCourseModule = Omit<typeof courseModule.$inferInsert, "id">;

// Lesson types
export type CourseLesson = typeof courseLesson.$inferSelect;
export type NewCourseLesson = Omit<typeof courseLesson.$inferInsert, "id">;

// ========== Course Mutations ==========

export async function insertCourse({ newCourse }: { newCourse: NewCourse }) {
  const id = `course:${ulid()}`;
  const newCourseWithId = { id, ...newCourse };

  try {
    const [result] = await db
      .insert(course)
      .values(newCourseWithId)
      .returning();
    return result;
  } catch (err) {
    log.error(err, "Failed to insert course");
    throw err;
  }
}

export async function updateCourse({
  courseId,
  updates,
}: {
  courseId: string;
  updates: Partial<Course>;
}) {
  try {
    const [result] = await db
      .update(course)
      .set({ ...updates })
      .where(eq(course.id, courseId))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update course with id ${courseId}`);
    throw err;
  }
}

export async function deleteCourse({ courseId }: { courseId: string }) {
  try {
    const [result] = await db
      .delete(course)
      .where(eq(course.id, courseId))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to delete course with id ${courseId}`);
    throw err;
  }
}

// ========== Module Mutations ==========

export async function insertModule({
  newModule,
}: {
  newModule: NewCourseModule;
}) {
  const id = `module:${ulid()}`;
  const newModuleWithId = { id, ...newModule };

  try {
    const [result] = await db
      .insert(courseModule)
      .values(newModuleWithId)
      .returning();
    return result;
  } catch (err) {
    log.error(err, "Failed to insert module");
    throw err;
  }
}

export async function updateModule({
  moduleId,
  updates,
}: {
  moduleId: string;
  updates: Partial<CourseModule>;
}) {
  try {
    const [result] = await db
      .update(courseModule)
      .set({ ...updates })
      .where(eq(courseModule.id, moduleId))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update module with id ${moduleId}`);
    throw err;
  }
}

export async function deleteModule({ moduleId }: { moduleId: string }) {
  try {
    const [result] = await db
      .delete(courseModule)
      .where(eq(courseModule.id, moduleId))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to delete module with id ${moduleId}`);
    throw err;
  }
}

export async function reorderModules({
  modules,
}: {
  modules: { id: string; order: number }[];
}) {
  try {
    const results = await Promise.all(
      modules.map(({ id, order }) =>
        db
          .update(courseModule)
          .set({ order })
          .where(eq(courseModule.id, id))
          .returning(),
      ),
    );

    return results.flat();
  } catch (err) {
    log.error(err, "Failed to reorder modules");
    throw err;
  }
}

// ========== Lesson Mutations ==========

export async function insertLesson({
  newLesson,
}: {
  newLesson: NewCourseLesson;
}) {
  const id = `lesson:${ulid()}`;
  const newLessonWithId = { id, ...newLesson };

  try {
    const [result] = await db
      .insert(courseLesson)
      .values(newLessonWithId)
      .returning();
    return result;
  } catch (err) {
    log.error(err, "Failed to insert lesson");
    throw err;
  }
}

export async function updateLesson({
  lessonId,
  updates,
}: {
  lessonId: string;
  updates: Partial<CourseLesson>;
}) {
  try {
    const [result] = await db
      .update(courseLesson)
      .set({ ...updates })
      .where(eq(courseLesson.id, lessonId))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update lesson with id ${lessonId}`);
    throw err;
  }
}

export async function deleteLesson({ lessonId }: { lessonId: string }) {
  try {
    const [result] = await db
      .delete(courseLesson)
      .where(eq(courseLesson.id, lessonId))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to delete lesson with id ${lessonId}`);
    throw err;
  }
}

export async function reorderLessons({
  lessons,
}: {
  lessons: { id: string; order: number }[];
}) {
  try {
    const results = await Promise.all(
      lessons.map(({ id, order }) =>
        db
          .update(courseLesson)
          .set({ order })
          .where(eq(courseLesson.id, id))
          .returning(),
      ),
    );

    return results.flat();
  } catch (err) {
    log.error(err, "Failed to reorder lessons");
    throw err;
  }
}

export async function moveLessonToModule({
  lessonId,
  newModuleId,
  newOrder,
}: {
  lessonId: string;
  newModuleId: string;
  newOrder: number;
}) {
  try {
    const [result] = await db
      .update(courseLesson)
      .set({ moduleId: newModuleId, order: newOrder })
      .where(eq(courseLesson.id, lessonId))
      .returning();

    return result;
  } catch (err) {
    log.error(
      err,
      `Failed to move lesson ${lessonId} to module ${newModuleId}`,
    );
    throw err;
  }
}
