import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserById } from "~/db/mutations/user.js";
import { getUserById } from "~/db/queries/user.js";

export async function deleteUserHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "handlers:users:delete",
  });

  // TODO: Check if the user has permission

  const { userId } = request.params;

  try {
    const user = await getUserById(userId);

    if (!user) {
      log.debug(`User with id ${userId} not found`);
      return reply.server.httpErrors.notFound({ error: "User not found" });
    }

    const deletedUser = await deleteUserById(userId);

    if (!deletedUser) {
      log.debug(`Failed to delete user with id ${userId}`);
      return reply.server.httpErrors.internalServerError();
    }

    log.debug(`User with id ${userId} deleted successfully`);

    reply.statusCode = 204;

    return;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Error deleting user with id ${userId}`);
    }

    return reply.server.httpErrors.internalServerError();
  }
}
