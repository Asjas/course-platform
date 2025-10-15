import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserById } from "~/routes/users/mutations.js";
import { getUserById } from "~/routes/users/queries.js";

export async function deleteUserByIdHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:users:delete:id",
  });

  // TODO: Check if the user has permission

  const { userId } = request.params;

  try {
    const user = await getUserById({ userId });

    if (!user) {
      log.debug(`User with id ${userId} not found`);
      return reply.notFound("User not found");
    }

    const deletedUser = await deleteUserById({ userId });

    if (!deletedUser) {
      log.debug(`Failed to delete user with id ${userId}`);
      return reply.internalServerError();
    }

    log.debug(`User with id ${userId} deleted successfully`);

    reply.statusCode = 204;

    return;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Error deleting user with id ${userId}`);
    }

    return reply.internalServerError();
  }
}
