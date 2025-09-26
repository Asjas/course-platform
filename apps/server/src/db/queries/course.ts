import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:queries:course" });

// All all courses as admin are accessible by admins only
// since enrollments, progress and wishlists are included
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
    log.error(err, "Failed to get all courses as admin");
    throw err;
  }
}

// Getting a single course as admin are accessible by admins only
// since enrollments, progress and wishlists are included
export async function getCourseByIdAsAdmin(id: string) {
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
      where: (course) => eq(course.id, sql.placeholder("id")),
    })
    .prepare("getCourseByIdAsAdmin");

  try {
    const course = await preparedStatement.execute({ id });

    return course ?? null;
  } catch (err) {
    log.error(err, `Failed to get course with id ${id} as admin`);
    throw err;
  }
}

// All courses are accessible by all users
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
    log.error(err, "Failed to get all courses");
    throw err;
  }
}

// Individual courses are accessible by all users
export async function getCourseById(id: string) {
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
      where: (course) => eq(course.id, sql.placeholder("id")),
    })
    .prepare("getCourseById");

  try {
    const course = await preparedStatement.execute({ id });

    return course ?? null;
  } catch (err) {
    log.error(err, `Failed to get course with id ${id}`);
    throw err;
  }
}
