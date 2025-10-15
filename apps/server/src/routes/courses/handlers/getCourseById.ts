import type { FastifyReply, FastifyRequest } from "fastify";
import { getCourseById } from "~/routes/courses/queries.js";

export async function getCourseByIdHandler(
  request: FastifyRequest<{ Params: { courseId: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:courses:get:id",
  });

  const { courseId } = request.params;

  try {
    const course = await getCourseById({ courseId });

    if (!course) {
      log.debug(`Course with id ${courseId} not found`);
      return reply.notFound("Course not found");
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Fetched course with id ${courseId} successfully`);

    return course;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to fetch course with id ${courseId}`);
    }

    return reply.internalServerError();
  }
}
