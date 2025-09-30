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
    Params: { userId: string };
    Body: Partial<{ name: string; email: string }>;
  }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:users:update",
  });

  // TODO: Check if the user has permission

  const { userId } = request.params;
  const updates = request.body;

  if (Object.keys(updates).length === 0) {
    log.warn("No updates provided");
    return reply.status(400).send({ error: "No user updates provided" });
  }

  try {
    const user = await getUserById(userId);

    if (!user) {
      log.warn(`User with id ${userId} not found for update`);
      return reply.status(404).send({ error: `User not found` });
    }

    // Check if the user has permission
    // if (request.user.id !== id && !request.user.isAdmin) {
    //   log.warn(
    //     { id, userId: request.user.id },
    //     "Unauthorized update attempt",
    //   );
    //   return reply.status(403).send({ error: "Forbidden" });
    // }
    const updatedUser = await updateUserById(userId, updates);

    if (!updatedUser) {
      log.error(`Failed to update user with id ${userId}`);
      return reply.status(500).send({ error: "Failed to update user" });
    }

    log.info(`User with id ${userId} updated successfully`);

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    reply.statusCode = 201;

    return updatedUser;
  } catch (err) {
    log.error(err, `Error updating user with id ${userId}`);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
