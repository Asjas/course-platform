import type { FastifyReply, FastifyRequest } from "fastify";

export async function getAllUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:users:get:all",
  });

  try {
    const { users, count } = await reply.server.cache.getAllUsers();

    if (!users) {
      log.debug("No users found");
      return reply.notFound("No users found");
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`Fetched all ${count} users`);

    return { users, count };
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Failed to fetch all users");
    }

    return reply.internalServerError();
  }
}
