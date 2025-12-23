import { TRPCError } from "@trpc/server";
import * as z from "zod";
import {
  isAdmin,
  protectedProcedure,
  publicProcedure,
  router,
} from "~/router.js";
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
  getCourseProgress,
  getEnrollmentStatus,
  getLessonProgress,
} from "~/routers/courses/queries.js";

export const coursesRouter = router({
  // Admin query to get all courses with full details
  getAllAsAdmin: publicProcedure.use(isAdmin).query(async ({ ctx }) => {
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

  getAll: publicProcedure.query(async ({ ctx }) => {
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
    .query(async ({ ctx, input }) => {
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
    .query(async ({ ctx, input }) => {
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
    .query(async ({ ctx, input }) => {
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
    .query(async ({ ctx, input }) => {
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
    .query(async ({ ctx, input }) => {
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
    .query(async ({ ctx, input }) => {
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

  // ========== Course Mutations ==========

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

      const [err, course] = await fastify.to(
        insertCourse({ newCourse: input }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      await fastify.cache.invalidateAll(["course~all"]);

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
});
