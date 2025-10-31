import { db, eq, sql } from "@packages/db";

const preparedGetAllCoursesAsAdminStatement = db.query.course
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

const preparedGetCourseByIdAsAdminStatement = db.query.course
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

const preparedGetCourseByIdStatement = db.query.course
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

const preparedGetModulesAndLessonsByCourseIdStatement = db.query.course
  .findFirst({
    with: {
      modules: {
        with: {
          lessons: true,
        },
      },
    },
    where: (course) => eq(course.id, sql.placeholder("courseId")),
  })
  .prepare("getModulesAndLessonsByCourseId");

export async function getAllAsAdminCourses() {
  const [courses] = await preparedGetAllCoursesAsAdminStatement.execute();

  return courses;
}

export async function getCourseByIdAsAdmin({ courseId }: { courseId: string }) {
  const course = await preparedGetCourseByIdAsAdminStatement.execute({
    courseId,
  });

  return course;
}

export async function getAllCourses() {
  const [courses] = await preparedGetAllCourses.execute();

  return courses;
}

export async function getCourseById({ courseId }: { courseId: string }) {
  const course = await preparedGetCourseByIdStatement.execute({ courseId });

  return course ?? null;
}

export async function getModulesAndLessonsByCourseId({
  courseId,
}: {
  courseId: string;
}) {
  const course = await preparedGetModulesAndLessonsByCourseIdStatement.execute({
    courseId,
  });

  return course?.modules ?? [];
}
