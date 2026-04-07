import { TRPCError } from "@trpc/server";
import pLimit from "p-limit";
import * as z from "zod";
import { getEnrolledUsersByCourseId } from "~/db/queries/user.js";
import { dispatchNotification } from "~/lib/notifications.js";
import {
  type EntitySyncUpdate,
  coursesSyncConfig,
  createSyncUpdate,
  getEntityUpdatesSince,
  publishEntityChange,
  streamEntityUpdates,
} from "~/lib/sse-sync.js";
import {
  isAdmin,
  protectedProcedure,
  publicProcedure,
  router,
} from "~/router.js";
import type {
  Course,
  CourseLesson as Lesson,
  CourseModule as Module,
} from "~/routers/courses/mutations.js";
import {
  deleteCourse,
  deleteLesson,
  deleteModule,
  insertCourse,
  insertLesson,
  insertModule,
  moveLessonToModule,
  reorderLessons,
  reorderModules,
  updateCourse,
  updateLesson,
  updateModule,
} from "~/routers/courses/mutations.js";
import {
  checkCoursePublishReadiness,
  getAllCourseProgressAsAdmin,
  getCourseProgress,
  getEnrollmentStatus,
  getLessonProgress,
} from "~/routers/courses/queries.js";
import type {
  AllCourseProgressAsAdmin,
  AllCourses,
  AllCoursesAsAdmin,
  CourseById,
  CourseProgress,
  EnrollmentStatus,
  LessonById,
  LessonProgress,
  ModulesAndLessonsByCourseId,
  PublishReadinessResult,
} from "~/routers/courses/queries.js";

export type { PublishReadinessIssue } from "~/routers/courses/queries.js";
export type { PublishReadinessResult };

export type CourseSyncUpdate = EntitySyncUpdate<Course>;
export type ModuleSyncUpdate = EntitySyncUpdate<Module>;
export type LessonSyncUpdate = EntitySyncUpdate<Lesson>;

export const coursesRouter = router({
  // Admin query to get all courses with full details
  getAllAsAdmin: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<AllCoursesAsAdmin> => {
      const fastify = ctx.reply.server;

      const [err, courses] = await fastify.to(
        fastify.cache.getAllCoursesAsAdmin(),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return courses;
    }),

  getAll: publicProcedure.query(async ({ ctx }): Promise<AllCourses> => {
    const fastify = ctx.reply.server;

    const [err, courses] = await fastify.to(fastify.cache.getAllCourses());

    if (err) {
      fastify.log.error(err);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
    }

    return courses;
  }),

  getById: publicProcedure
    .input(
      z.object({
        courseId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<NonNullable<CourseById>> => {
      const { courseId } = input;
      const fastify = ctx.reply.server;

      const [err, course] = await fastify.to(
        fastify.cache.getCourseById({ courseId }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return course;
    }),

  getModulesAndLessonsByCourseId: publicProcedure
    .input(
      z.object({
        courseId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<ModulesAndLessonsByCourseId> => {
      const { courseId } = input;
      const fastify = ctx.reply.server;

      const [err, modulesAndLessons] = await fastify.to(
        fastify.cache.getModulesAndLessonsByCourseId({ courseId }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return modulesAndLessons;
    }),

  getLessonById: publicProcedure
    .input(
      z.object({
        lessonId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<NonNullable<LessonById>> => {
      const { lessonId } = input;
      const fastify = ctx.reply.server;

      const [err, lesson] = await fastify.to(
        fastify.cache.getLessonById({ lessonId }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      return lesson;
    }),

  getCourseProgress: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<CourseProgress> => {
      const { courseId } = input;
      const fastify = ctx.reply.server;
      const userId = ctx.user.id;

      const [err, progress] = await fastify.to(
        getCourseProgress({ userId, courseId }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return progress;
    }),

  getLessonProgress: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<LessonProgress> => {
      const { lessonId } = input;
      const fastify = ctx.reply.server;
      const userId = ctx.user.id;

      const [err, progress] = await fastify.to(
        getLessonProgress({ userId, lessonId }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return progress;
    }),

  getEnrollmentStatus: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<EnrollmentStatus> => {
      const { courseId } = input;
      const fastify = ctx.reply.server;
      const userId = ctx.user.id;

      const [err, enrollment] = await fastify.to(
        getEnrollmentStatus({ userId, courseId }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return enrollment;
    }),

  getAllProgressAsAdmin: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<AllCourseProgressAsAdmin> => {
      const fastify = ctx.reply.server;

      const [err, progress] = await fastify.to(getAllCourseProgressAsAdmin());

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return progress;
    }),

  // ========== Course Mutations ==========

  checkPublishReadiness: publicProcedure
    .input(z.object({ courseId: z.string() }))
    .use(isAdmin)
    .query(async ({ ctx, input }): Promise<PublishReadinessResult> => {
      const fastify = ctx.reply.server;
      const { courseId } = input;

      const [err, result] = await fastify.to(
        checkCoursePublishReadiness(courseId),
      );

      if (err || !result) {
        fastify.log.error(
          { err, courseId },
          "Failed to check publish readiness",
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check publish readiness",
        });
      }

      return result;
    }),

  createCourse: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        name: z.string(),
        description: z.string().nullable().optional(),
        level: z
          .enum(["All levels", "Beginner", "Intermediate", "Advanced"])
          .optional(),
        thumbnailUrl: z.string().nullable().optional(),
        published: z.boolean().optional(),
        isFree: z.boolean().optional(),
        price: z.number().int().min(0).optional(),
        priceCurrency: z.string().optional(),
        isSaleActive: z.boolean().optional(),
        salePrice: z.number().int().min(0).optional(),
        saleStartAt: z.date().nullable().optional(),
        saleExpiresAt: z.date().nullable().optional(),
        trialModuleLimit: z.number().int().min(0).optional(),
        authorId: z.string(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      // Force trialModuleLimit to 0 on creation since totalModules starts at 0
      // The constraint requires trialModuleLimit <= totalModules
      const [err, course] = await fastify.to(
        insertCourse({ newCourse: { ...input, trialModuleLimit: 0 } }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll(["course~all"]);

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          coursesSyncConfig,
          createSyncUpdate("created", course.id, course, ctx.user.id),
        );
      } catch (sseErr) {
        fastify.log.error(sseErr, "Failed to publish course to SSE");
      }

      return course;
    }),

  updateCourse: publicProcedure
    .input(
      z.object({
        id: z.string(),
        slug: z.string().optional(),
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        level: z
          .enum(["All levels", "Beginner", "Intermediate", "Advanced"])
          .optional(),
        thumbnailUrl: z.string().nullable().optional(),
        published: z.boolean().optional(),
        isFree: z.boolean().optional(),
        price: z.number().int().min(0).optional(),
        priceCurrency: z.string().optional(),
        isSaleActive: z.boolean().optional(),
        salePrice: z.number().int().min(0).optional(),
        saleStartAt: z.date().nullable().optional(),
        saleExpiresAt: z.date().nullable().optional(),
        trialModuleLimit: z.number().int().min(0).optional(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const fastify = ctx.reply.server;

      // Publish gating: when the request is explicitly publishing a course,
      // verify that every video lesson has a valid transcript before allowing it.
      if (updates.published === true) {
        const [readinessErr, readiness] = await fastify.to(
          checkCoursePublishReadiness(id),
        );

        if (readinessErr) {
          fastify.log.error(
            { err: readinessErr, courseId: id },
            "Failed to check publish readiness",
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to check publish readiness",
          });
        }

        if (!readiness?.ready) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Course cannot be published: some lessons are missing valid transcripts",
            cause: readiness?.issues,
          });
        }
      }

      const [err, course] = await fastify.to(
        updateCourse({ courseId: id, updates }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll(["course~all", `course~id~${id}`]);

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          coursesSyncConfig,
          createSyncUpdate("updated", course.id, course, ctx.user.id),
        );
      } catch (sseErr) {
        fastify.log.error(sseErr, "Failed to publish course update to SSE");
      }

      // Notify enrolled users about course update
      try {
        const enrolledUsers = await getEnrolledUsersByCourseId(id);
        const limit = pLimit(10);
        await Promise.all(
          enrolledUsers.map((enrolledUser) =>
            limit(() =>
              dispatchNotification({
                userId: enrolledUser.id,
                baseKey: "course:course_update",
                browserNotification: {
                  type: "course_published",
                  title: `Course updated: ${course.name}`,
                  message: `The course "${course.name}" has been updated with new content.`,
                  link: `/courses/${course.id}`,
                },
                emailNotification: {
                  subject: `Course update: ${course.name}`,
                  text: `The course "${course.name}" has been updated.\n\nVisit the course to see the latest changes: /courses/${course.id}`,
                },
              }),
            ),
          ),
        );
      } catch (notifErr) {
        // TODO: report to Sentry once configured
        fastify.log.error(
          notifErr,
          "Failed to dispatch course update notifications",
        );
      }

      return course;
    }),

  deleteCourse: publicProcedure
    .input(z.object({ courseId: z.string() }))
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, course] = await fastify.to(deleteCourse(input));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "course~all",
        `course~id~${input.courseId}`,
      ]);

      // Publish to SSE stream for real-time updates
      try {
        await publishEntityChange(
          coursesSyncConfig,
          createSyncUpdate("deleted", input.courseId, null, ctx.user.id),
        );
      } catch (sseErr) {
        fastify.log.error(sseErr, "Failed to publish course deletion to SSE");
      }

      return course;
    }),

  // ========== Module Mutations ==========

  createModule: publicProcedure
    .input(
      z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string(),
        order: z.number().int().min(0),
        isPreview: z.boolean().optional(),
        courseId: z.string(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, module] = await fastify.to(
        insertModule({ newModule: input }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "course~all",
        `course~id~${input.courseId}`,
      ]);

      return module;
    }),

  updateModule: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        order: z.number().int().min(0).optional(),
        isPreview: z.boolean().optional(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const fastify = ctx.reply.server;

      const [err, module] = await fastify.to(
        updateModule({ moduleId: id, updates }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "course~all",
        `course~id~${module.courseId}`,
      ]);

      return module;
    }),

  deleteModule: publicProcedure
    .input(z.object({ moduleId: z.string() }))
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, module] = await fastify.to(deleteModule(input));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "course~all",
        `course~id~${module.courseId}`,
      ]);

      return module;
    }),

  reorderModules: publicProcedure
    .input(
      z.object({
        modules: z.array(z.object({ id: z.string(), order: z.number().int() })),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, modules] = await fastify.to(reorderModules(input));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      // Invalidate cache for all affected courses
      const courseIds = [...new Set(modules.map((m) => m.courseId))];

      await fastify.cache.invalidateAll([
        "course~all",
        ...courseIds.map((id) => `course~id~${id}`),
      ]);

      return modules;
    }),

  // ========== Lesson Mutations ==========

  createLesson: publicProcedure
    .input(
      z.object({
        title: z.string(),
        slug: z.string(),
        videoUrl: z.string(),
        videoProvider: z.enum(["youtube"]).optional(),
        content: z.any(),
        transcription: z.any(),
        duration: z.number().int().nullable().optional(),
        order: z.number().int().min(0),
        isPreview: z.boolean().optional(),
        courseId: z.string(),
        moduleId: z.string(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, lesson] = await fastify.to(
        insertLesson({ newLesson: input }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "course~all",
        `course~id~${input.courseId}`,
      ]);

      return lesson;
    }),

  updateLesson: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        slug: z.string().optional(),
        videoUrl: z.string().optional(),
        videoProvider: z.enum(["youtube"]).optional(),
        content: z.any().optional(),
        transcription: z.any().optional(),
        duration: z.number().int().nullable().optional(),
        order: z.number().int().min(0).optional(),
        isPreview: z.boolean().optional(),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const fastify = ctx.reply.server;

      const [err, lesson] = await fastify.to(
        updateLesson({ lessonId: id, updates }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "course~all",
        `course~id~${lesson.courseId}`,
      ]);

      // Notify enrolled users about lesson update
      try {
        const enrolledUsers = await getEnrolledUsersByCourseId(lesson.courseId);
        const limit = pLimit(10);
        await Promise.all(
          enrolledUsers.map((enrolledUser) =>
            limit(() =>
              dispatchNotification({
                userId: enrolledUser.id,
                baseKey: "course:lesson_update",
                browserNotification: {
                  type: "course_published",
                  title: `Lesson updated: ${lesson.title}`,
                  message: `A lesson in your course has been updated: "${lesson.title}".`,
                  link: `/courses/${lesson.courseId}/lessons/${lesson.id}`,
                },
                emailNotification: {
                  subject: `Lesson updated: ${lesson.title}`,
                  text: `A lesson you are enrolled in has been updated: "${lesson.title}".\n\nVisit the lesson to see the changes.`,
                },
              }),
            ),
          ),
        );
      } catch (notifErr) {
        // TODO: report to Sentry once configured
        fastify.log.error(
          notifErr,
          "Failed to dispatch lesson update notifications",
        );
      }

      return lesson;
    }),

  deleteLesson: publicProcedure
    .input(z.object({ lessonId: z.string() }))
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, lesson] = await fastify.to(deleteLesson(input));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "course~all",
        `course~id~${lesson.courseId}`,
      ]);

      return lesson;
    }),

  reorderLessons: publicProcedure
    .input(
      z.object({
        lessons: z.array(z.object({ id: z.string(), order: z.number().int() })),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, lessons] = await fastify.to(reorderLessons(input));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      // Invalidate cache for all affected courses
      const courseIds = [...new Set(lessons.map((l) => l.courseId))];

      await fastify.cache.invalidateAll([
        "course~all",
        ...courseIds.map((id) => `course~id~${id}`),
      ]);

      return lessons;
    }),

  moveLessonToModule: publicProcedure
    .input(
      z.object({
        lessonId: z.string(),
        newModuleId: z.string(),
        newOrder: z.number().int().min(0),
      }),
    )
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, lesson] = await fastify.to(moveLessonToModule(input));

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll([
        "course~all",
        `course~id~${lesson.courseId}`,
      ]);

      return lesson;
    }),

  /**
   * Subscribe to real-time course updates via SSE.
   * Clients receive updates when courses are created, updated, or deleted.
   */
  subscribeToUpdates: publicProcedure
    .input(
      z.object({
        lastEventId: z.string().nullish(),
      }),
    )
    .subscription(async function* ({ input }) {
      yield* streamEntityUpdates<Course>(coursesSyncConfig, input.lastEventId);
    }),

  /**
   * Get course updates since a specific timestamp.
   * Useful for syncing offline clients that have been disconnected.
   */
  getUpdatesSince: publicProcedure
    .input(
      z.object({
        since: z.number(), // Timestamp in ms
      }),
    )
    .query(async ({ input }) => {
      try {
        const updates = await getEntityUpdatesSince<Course>(
          coursesSyncConfig,
          input.since,
        );
        return updates;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch course updates",
        });
      }
    }),
});
