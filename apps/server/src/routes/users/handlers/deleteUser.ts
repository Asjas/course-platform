import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserById } from "~/db/mutations/user.js";
import { getUserById } from "~/db/queries/user.js";

export async function deleteUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:users:delete",
  });

  const { id } = request.params;

  try {
    const user = await getUserById(id);

    if (!user) {
      log.warn({ userId: id }, "User not found for deletion");
      return reply.status(404).send({ error: "User not found" });
    }

    // Check if the user has permission
    // if (request.user.id !== id && !request.user.isAdmin) {
    //   log.warn(
    //     { id, userId: request.user.id },
    //     "Unauthorized delete attempt",
    //   );
    //   return reply.status(403).send({ error: "Forbidden" });
    // }
    const deletedUser = await deleteUserById(id);

    if (!deletedUser) {
      log.error({ userId: id }, "Failed to delete user");
      return reply.status(500).send({ error: "Failed to delete user" });
    }

    log.info({ userId: id }, "User deleted successfully");

    return reply.status(204).send();
  } catch (error) {
    log.error({ err: error, userId: id }, "Error deleting user");
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
