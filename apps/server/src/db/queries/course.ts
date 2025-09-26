import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { ONE_WEEK } from "~/lib/constants.js";
import { redis } from "~/lib/redis.js";

// All admin courses are accessible by admins only
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

  const courses = await preparedStatement.execute();

  return { courses, count: courses.length };
}

// All admin courses are accessible by admins only
// since enrollments, progress and wishlists are included
export async function getAllCoursesAsAdminCached() {
  const cacheKey = `adminCourses:all`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const courses = await getAllCoursesAsAdmin();
  if (courses.count > 0) {
    await redis.setex(cacheKey, JSON.stringify(courses), ONE_WEEK);
  }

  return courses;
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

  const courses = await preparedStatement.execute();

  return { courses, count: courses.length };
}

// All courses are accessible by all users
export async function getAllCoursesCached() {
  const cacheKey = `courses:all`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const courses = await getAllCourses();
  if (courses.count > 0) {
    await redis.setex(cacheKey, JSON.stringify(courses), ONE_WEEK);
  }

  return courses;
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

  const course = await preparedStatement.execute({ id });

  return course ?? null;
}

// Individual courses are accessible by all users
export async function getCourseByIdCached(id: string) {
  const cacheKey = `course:id:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const course = await getCourseById(id);
  if (course) {
    await redis.setex(cacheKey, JSON.stringify(course), ONE_WEEK);
  }

  return course;
}
