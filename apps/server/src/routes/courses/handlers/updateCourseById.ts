import type { FastifyReply, FastifyRequest } from "fastify";
import { type Course, updateCourseById } from "~/routes/courses/mutations.js";
import { getCourseById } from "~/routes/courses/queries.js";

export async function updateCourseByIdHandler(
  request: FastifyRequest<{
    Params: { courseId: string };
    Body: { updates: Course };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:courses:update:id",
  });

  const { courseId } = request.params;
  const { updates } = request.body;

  if (!updates || Object.keys(updates).length === 0) {
    log.debug("No course data provided in request body");
    return reply.badRequest("No course data provided in request body");
  }

  try {
    const existing = await getCourseById({ courseId });

    if (!existing) {
      log.debug(`Course with id ${courseId} not found for update`);
      return reply.notFound("Course not found");
    }

    const updated = await updateCourseById({ courseId, updates });

    if (!updated) {
      log.debug(`Failed to update course with id ${courseId}`);
      return reply.internalServerError();
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Course with id ${courseId} updated successfully`);

    return updated;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Error updating course with id ${courseId}`);
    }

    return reply.internalServerError();
  }
}
