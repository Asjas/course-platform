import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
} from "fastify";
import {
  type Course,
  deleteCourseById,
  updateCourseById,
} from "~/db/mutations/course.js";
import { getAllCourses, getCourseById } from "~/db/queries/course.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  FIVE_MINUTES,
  ONE_DAY,
} from "~/lib/constants.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "routes:courses:private" });

export default function courseRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.get("/courses", async (_request, reply) => {
    const courses = await getAllCourses();

    if (!courses) {
      log.warn("No courses found");
      return reply.status(404).send({ error: "No courses found" });
    }

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: FIVE_MINUTES,
        staleIfError: ONE_DAY * 2,
      }),
    );

    log.info(
      { count: courses.count },
      "Fetched all courses with private caching",
    );

    return courses;
  });

  fastify.get(
    "/courses/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params;

      try {
        const course = await getCourseById(id);

        if (!course) {
          log.warn({ id }, "Course not found");
          return reply.status(404).send({ error: "Course not found" });
        }

        reply.headers(
          CACHE_PRIVATE_REVALIDATE({
            maxAge: ONE_DAY,
            staleIfError: ONE_DAY * 2,
          }),
        );

        log.info({ id }, "Fetched course by ID with private caching");

        return course;
      } catch (error) {
        log.error({ err: error, id }, "Error fetching course by ID");
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.put(
    "/courses/:id",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: Partial<Course>;
      }>,
      reply,
    ) => {
      const { id } = request.params;

      if (!request.body || Object.keys(request.body).length === 0) {
        log.warn({ id }, "No update data provided");
        return reply.status(400).send({ error: "No update data provided" });
      }

      try {
        const existingCourse = await getCourseById(id);
        if (!existingCourse) {
          log.warn({ id }, "Course not found for update");
          return reply.status(404).send({ error: "Course not found" });
        }

        const updatedCourse = await updateCourseById({
          id,
          updates: request.body,
        });

        log.info({ id }, "Course updated successfully");

        return updatedCourse;
      } catch (error) {
        log.error({ err: error, id }, "Error updating course");
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.delete("/courses/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const existingCourse = await getCourseById(id);
      if (!existingCourse) {
        log.warn({ id }, "Course not found for deletion");
        return reply.status(404).send({ error: "Course not found" });
      }

      const result = await deleteCourseById(existingCourse);

      if (!result) {
        log.error({ id }, "Failed to delete course");
        return reply.status(500).send({ error: "Failed to delete course" });
      }

      log.info({ id }, "Course deleted successfully");

      return reply.status(204).send();
    } catch (error) {
      log.error({ err: error, id }, "Error deleting course");
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  done();
}
