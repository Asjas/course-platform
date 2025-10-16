import type { FastifyReply, FastifyRequest } from "fastify";
import { type User, updateUserById } from "~/routes/users/mutations.js";
import { getUserById } from "~/routes/users/queries.js";

export async function updateUserByIdHandler(
  request: FastifyRequest<{
    Params: { userId: string };
    Body: { updates: User };
  }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:users:update:id",
  });

  const { userId } = request.params;
  const { updates } = request.body;

  if (Object.keys(updates).length === 0) {
    log.debug("No user data provided in request body");
    return reply.badRequest("No user data provided in request body");
  }

  try {
    const existingUser = await getUserById({ userId });

    // TODO: Check if the user has permission to update this user

    if (!existingUser) {
      log.debug(`User with id ${userId} not found for update`);
      return reply.notFound("User not found");
    }

    const updatedUser = await updateUserById({ userId, updates });

    if (!updatedUser) {
      log.debug(`Failed to update user with id ${userId}`);
      return reply.internalServerError();
    }

    await reply.server.cache.invalidateAll([`user:${userId}`, "users:all"]);

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Cookie");

    log.debug(`User with id ${userId} updated successfully`);

    return updatedUser;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Error updating user with id ${userId}`);
    }

    return reply.internalServerError();
  }
}
