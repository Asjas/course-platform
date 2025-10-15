import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ routes: "db:queries:courses" });

export async function getAllCoursesAsAdmin() {
  const preparedStatement = db.query.course
    .findMany({
      with: {
        enrollments: true,
        wishlists: true,
        modules: true,
        lessons: true,
        progress: true,
        reviews: true,
        instructorNotes: true,
        faq: true,
      },
    })
    .prepare("getAllCoursesAsAdmin");

  try {
    const courses = await preparedStatement.execute();

    return { courses, count: courses.length };
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Failed to get all courses");
    }

    throw err;
  }
}

export async function getCourseByIdAsAdmin({ courseId }: { courseId: string }) {
  const preparedStatement = db.query.course
    .findFirst({
      with: {
        enrollments: true,
        wishlists: true,
        modules: {
          with: {
            lessons: true,
          },
        },
        progress: true,
        reviews: {
          with: { user: true },
        },
        instructorNotes: true,
        faq: true,
      },
      where: (course) => eq(course.id, sql.placeholder("idcourseId")),
    })
    .prepare("getCourseByIdAsAdmin");

  try {
    const course = await preparedStatement.execute({ courseId });

    return course ?? null;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to get course with id ${courseId}`);
    }

    throw err;
  }
}

export async function getAllCourses() {
  const preparedStatement = db.query.course
    .findMany({
      with: {
        reviews: { with: { user: true } },
        modules: true,
        lessons: true,
        instructorNotes: true,
        faq: true,
      },
    })
    .prepare("getAllCourses");

  try {
    const courses = await preparedStatement.execute();

    return { courses, count: courses.length };
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Failed to get all courses");
    }

    throw err;
  }
}

export async function getCourseById({ courseId }: { courseId: string }) {
  const preparedStatement = db.query.course
    .findFirst({
      with: {
        modules: {
          with: {
            lessons: true,
          },
        },
        reviews: {
          with: { user: true },
        },
        instructorNotes: true,
        faq: true,
      },
      where: (course) => eq(course.id, sql.placeholder("courseId")),
    })
    .prepare("getCourseById");

  try {
    const course = await preparedStatement.execute({ courseId });

    return course ?? null;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to get course with id ${courseId}`);
    }

    throw err;
  }
}
