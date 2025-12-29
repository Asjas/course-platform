import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ routes: "db:queries:courses" });

// Module-scoped prepared statements
const preparedGetAllCoursesAsAdmin = db.query.course
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

const preparedGetCourseByIdAsAdmin = db.query.course
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
    where: (course) => eq(course.id, sql.placeholder("courseId")),
  })
  .prepare("getCourseByIdAsAdmin");

const preparedGetAllCourses = db.query.course
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

const preparedGetCourseById = db.query.course
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

export async function getAllCoursesAsAdmin() {
  try {
    const courses = await preparedGetAllCoursesAsAdmin.execute();

    return { courses, count: courses.length };
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Failed to get all courses");
    }

    throw err;
  }
}

export async function getCourseByIdAsAdmin({ courseId }: { courseId: string }) {
  try {
    const course = await preparedGetCourseByIdAsAdmin.execute({ courseId });

    return course ?? null;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to get course with id ${courseId}`);
    }

    throw err;
  }
}

export async function getAllCourses() {
  try {
    const courses = await preparedGetAllCourses.execute();

    return { courses, count: courses.length };
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Failed to get all courses");
    }

    throw err;
  }
}

export async function getCourseById({ courseId }: { courseId: string }) {
  try {
    const course = await preparedGetCourseById.execute({ courseId });

    return course ?? null;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to get course with id ${courseId}`);
    }

    throw err;
  }
}
