import type { FastifyReply, FastifyRequest } from "fastify";
import { getAllCourses } from "~/routes/courses/queries.js";

export async function getCoursesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:courses:get:all",
  });

  try {
    const courses = await getAllCourses();

    if (!courses) {
      log.debug("No courses found");
      return reply.notFound("No courses found");
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Fetched all ${courses.count} courses`);

    return courses;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Error fetching all courses");
    }
    return reply.internalServerError();
  }
}
