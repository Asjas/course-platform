import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { protectedProcedure, publicProcedure, router } from "~/router.js";
import {
  getCourseProgress,
  getEnrollmentStatus,
  getLessonProgress,
} from "~/routers/courses/queries.js";

export const coursesRouter = router({
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
});
