import type { FastifyReply, FastifyRequest } from "fastify";
import { getAllUsers } from "~/db/queries/user.js";

export async function getUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "handlers:users:all",
  });

  try {
    const users = await getAllUsers();

    if (!users) {
      log.debug("No users found");
      return reply.server.httpErrors.notFound({ error: "No users found" });
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Authorization");

    log.debug(`Fetched all ${users.count} users`);

    return users;
  } catch (error) {
    if (error instanceof Error) {
      log.error(error, "Failed to fetch all users");
    }

    return reply.server.httpErrors.internalServerError();
  }
}
