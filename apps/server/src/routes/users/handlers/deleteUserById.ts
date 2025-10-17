import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserById } from "~/routes/users/mutations.js";

export async function deleteUserByIdHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:users:delete:id",
  });

  // TODO: Check if the user has permission

  const fastify = request.server;
  const { userId } = request.params;

  const [err, deletedUser] = await fastify.to(deleteUserById({ userId }));

  if (err) {
    log.error(err, `Error deleting user with id ${userId}`);
    return reply.internalServerError();
  }

  if (!deletedUser) {
    log.debug(`Failed to delete user with id ${userId}`);
    return reply.internalServerError();
  }

  await reply.server.cache.invalidateAll([userId, "users~all"]);

  log.debug(`User with id ${userId} deleted successfully`);

  reply.statusCode = 204;

  return;
}
