import type { FastifyReply, FastifyRequest } from "fastify";
import { getAllUsers } from "~/routes/users/queries.js";

export async function getAllUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:users:all",
  });

  try {
    const users = await getAllUsers();

    if (!users) {
      log.debug("No users found");
      return reply.notFound("No users found");
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Fetched all ${users.count} users`);

    return users;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Failed to fetch all users");
    }

    return reply.internalServerError();
  }
}
