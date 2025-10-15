import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import { createCourseHandler } from "~/routes/courses/handlers/createCourse.js";
import { deleteCourseByIdHandler } from "~/routes/courses/handlers/deleteCourseById.js";
import { getCourseByIdHandler } from "~/routes/courses/handlers/getCourseById.js";
import { getCoursesHandler } from "~/routes/courses/handlers/getCourses.js";
import { updateCourseByIdHandler } from "~/routes/courses/handlers/updateCourseById.js";

export default function courseRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.get("/courses", getCoursesHandler);
  fastify.get("/courses/id/:id", getCourseByIdHandler);
  fastify.post("/courses", createCourseHandler);
  fastify.put("/courses/id/:id", updateCourseByIdHandler);
  fastify.delete("/courses/id/:id", deleteCourseByIdHandler);

  done();
}
