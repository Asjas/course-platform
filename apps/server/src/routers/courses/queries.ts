import { and, eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";

export type AllCourses = Awaited<ReturnType<typeof getAllCourses>>;
export type AllCoursesAsAdmin = Awaited<
  ReturnType<typeof getAllCoursesAsAdmin>
>;
export type CourseById = Awaited<ReturnType<typeof getCourseById>>;
export type LessonById = Awaited<ReturnType<typeof getLessonById>>;

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

export async function getAllCoursesAsAdmin() {
  const courses = await preparedGetAllCoursesAsAdminStatement.execute();

  return courses;
}

export async function getCourseByIdAsAdmin({ courseId }: { courseId: string }) {
  const course = await preparedGetCourseByIdAsAdminStatement.execute({
    courseId,
  });

  return course;
}

export async function getAllCourses() {
  const courses = await preparedGetAllCourses.execute();

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

const preparedGetLessonByIdStatement = db.query.courseLesson
  .findFirst({
    with: {
      module: true,
      course: true,
    },
    where: (lesson) => eq(lesson.id, sql.placeholder("lessonId")),
  })
  .prepare("getLessonById");

export async function getLessonById({ lessonId }: { lessonId: string }) {
  const lesson = await preparedGetLessonByIdStatement.execute({ lessonId });
  return lesson ?? null;
}

export async function getLessonProgress({
  userId,
  lessonId,
}: {
  userId: string;
  lessonId: string;
}) {
  const progress = await db.query.lessonProgress.findFirst({
    where: (progress) =>
      and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)),
  });

  return progress ?? null;
}

export async function getCourseProgress({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) {
  const progress = await db.query.courseProgress.findFirst({
    where: (progress) =>
      and(eq(progress.userId, userId), eq(progress.courseId, courseId)),
  });

  return progress ?? null;
}

export async function getEnrollmentStatus({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) {
  const enrollment = await db.query.enrollment.findFirst({
    where: (enrollment) =>
      and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId)),
  });

  return enrollment ?? null;
}
