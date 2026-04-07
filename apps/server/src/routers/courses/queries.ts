import { and, eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  type TranscriptIneligibleReason,
  checkTranscriptEligibility,
} from "~/lib/transcript.js";

export type AllCourses = Awaited<ReturnType<typeof getAllCourses>>;
export type AllCoursesAsAdmin = Awaited<
  ReturnType<typeof getAllCoursesAsAdmin>
>;
export type CourseById = Awaited<ReturnType<typeof getCourseById>>;
export type LessonById = Awaited<ReturnType<typeof getLessonById>>;
export type ModulesAndLessonsByCourseId = Awaited<
  ReturnType<typeof getModulesAndLessonsByCourseId>
>;
export type CourseProgress = Awaited<ReturnType<typeof getCourseProgress>>;
export type LessonProgress = Awaited<ReturnType<typeof getLessonProgress>>;
export type EnrollmentStatus = Awaited<ReturnType<typeof getEnrollmentStatus>>;

/** A single lesson blocking course publish due to a transcript issue. */
export interface PublishReadinessIssue {
  lessonId: string;
  lessonTitle: string;
  reason: TranscriptIneligibleReason;
}

/** Result of `checkCoursePublishReadiness`. */
export interface PublishReadinessResult {
  ready: boolean;
  issues: PublishReadinessIssue[];
}

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

export type AllCourseProgressAsAdmin = Awaited<
  ReturnType<typeof getAllCourseProgressAsAdmin>
>;

const preparedGetAllCourseProgressAsAdmin = db.query.courseProgress
  .findMany({
    with: {
      user: {
        columns: { id: true, name: true, email: true, image: true },
      },
      course: {
        columns: { id: true, name: true, slug: true },
      },
    },
    orderBy: (progress, { desc }) => [desc(progress.lastAccessedAt)],
  })
  .prepare("getAllCourseProgressAsAdmin");

export async function getAllCourseProgressAsAdmin() {
  return preparedGetAllCourseProgressAsAdmin.execute();
}

// ---------------------------------------------------------------------------
// Publish readiness
// ---------------------------------------------------------------------------

const preparedGetLessonsByCourseIdStatement = db.query.courseLesson
  .findMany({
    columns: {
      id: true,
      title: true,
      videoUrl: true,
      transcription: true,
    },
    where: (lesson) => eq(lesson.courseId, sql.placeholder("lessonsCourseId")),
  })
  .prepare("getLessonsByCourseId");

export async function getLessonsByCourseId({ courseId }: { courseId: string }) {
  return preparedGetLessonsByCourseIdStatement.execute({
    lessonsCourseId: courseId,
  });
}

/**
 * Check whether all video lessons in a course have publish-eligible
 * transcripts.
 *
 * Rules (from blueprint):
 *   - Non-video lessons (empty `videoUrl`) are exempt.
 *   - Preview lessons follow the same rule as regular video lessons.
 *   - Returns `{ ready: true, issues: [] }` when everything is eligible.
 *   - Returns `{ ready: false, issues: [...] }` identifying the blocking
 *     lessons so the caller can surface actionable errors to the admin.
 */
export async function checkCoursePublishReadiness(
  courseId: string,
): Promise<PublishReadinessResult> {
  const lessons = await getLessonsByCourseId({ courseId });

  const issues: PublishReadinessIssue[] = [];

  for (const lesson of lessons) {
    const hasVideo = !!lesson.videoUrl;
    const eligibility = checkTranscriptEligibility(
      lesson.transcription,
      hasVideo,
    );

    if (!eligibility.eligible) {
      issues.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        reason: eligibility.reason,
      });
    }
  }

  return { ready: issues.length === 0, issues };
}
