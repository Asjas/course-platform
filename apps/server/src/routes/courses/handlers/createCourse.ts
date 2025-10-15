import type { FastifyReply, FastifyRequest } from "fastify";
import { type NewCourse, insertCourse } from "~/routes/courses/mutations.js";

export async function createCourseHandler(
  request: FastifyRequest<{ Body: { newCourse: NewCourse } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:courses:create",
  });

  const { newCourse } = request.body;

  if (!newCourse) {
    log.debug("No course data provided in request body");
    return reply.badRequest("No course data provided in request body");
  }

  try {
    const result = await insertCourse({ newCourse });

    if (!result) {
      log.debug(`Failed to create course: ${JSON.stringify(newCourse)}`);
      return reply.badRequest("Failed to create course");
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Course created successfully with id ${result.id}`);

    reply.statusCode = 201;

    return result;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Error creating course: ${JSON.stringify(newCourse)}`);
    }

    return reply.internalServerError();
  }
}
