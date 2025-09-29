import type { FastifyReply, FastifyRequest } from "fastify";
import { updateUserById } from "~/db/mutations/user.js";
import { getUserById } from "~/db/queries/user.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  ONE_HOUR,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export async function updateUserHandler(
  request: FastifyRequest<{
    Params: { id: string };
    Body: Partial<{ name: string; email: string }>;
  }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:users:update",
  });

  const { id } = request.params;

  try {
    const user = await getUserById(id);

    if (!user) {
      log.warn({ userId: id }, "User not found for update");
      return reply.status(404).send({ error: "User not found" });
    }

    // Check if the user has permission
    // if (request.user.id !== id && !request.user.isAdmin) {
    //   log.warn(
    //     { id, userId: request.user.id },
    //     "Unauthorized update attempt",
    //   );
    //   return reply.status(403).send({ error: "Forbidden" });
    // }
    const updatedUser = await updateUserById({ id, updates: request.body });

    if (!updatedUser) {
      log.error({ userId: id }, "Failed to update user");
      return reply.status(500).send({ error: "Failed to update user" });
    }

    log.info({ userId: id }, "User updated successfully");

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    reply.statusCode = 201;

    return updatedUser;
  } catch (error) {
    log.error({ err: error, userId: id }, "Error updating user");
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
