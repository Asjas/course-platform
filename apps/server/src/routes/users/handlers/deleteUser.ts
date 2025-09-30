import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserById } from "~/db/mutations/user.js";
import { getUserById } from "~/db/queries/user.js";

export async function deleteUserHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:users:delete",
  });

  // TODO: Check if the user has permission

  const { userId } = request.params;

  try {
    const user = await getUserById(userId);

    if (!user) {
      log.warn(`User with id ${userId} not found`);
      return reply.status(404).send({ error: "User not found" });
    }

    const deletedUser = await deleteUserById(userId);

    if (!deletedUser) {
      log.error(`Failed to delete user with id ${userId}`);
      return reply.status(500).send({ error: "Failed to delete user" });
    }

    log.info(`User with id ${userId} deleted successfully`);

    return reply.status(204).send();
  } catch (err) {
    log.error(err, `Error deleting user with id ${userId}`);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
