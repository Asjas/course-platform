import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteCourseById } from "~/routes/courses/mutations.js";
import { getCourseById } from "~/routes/courses/queries.js";

export async function deleteCourseByIdHandler(
  request: FastifyRequest<{ Params: { courseId: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:courses:delete:id",
  });

  const { courseId } = request.params;

  try {
    const existing = await getCourseById({ courseId });

    if (!existing) {
      log.debug(`Course with id ${courseId} not found`);
      return reply.notFound("Course not found");
    }

    const result = await deleteCourseById({ courseId });

    if (!result) {
      log.debug(`Failed to delete course with id ${courseId}`);
      return reply.internalServerError();
    }

    log.debug(`Course with id ${courseId} deleted successfully`);

    reply.statusCode = 204;

    return;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Error deleting course with id ${courseId}`);
    }

    return reply.internalServerError();
  }
}
