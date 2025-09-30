import type { FastifyReply, FastifyRequest } from "fastify";
import { getAllUsers } from "~/db/queries/user.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  FIVE_MINUTES,
  ONE_HOUR,
} from "~/lib/constants.js";

export async function getUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:users:all",
  });

  try {
    const users = await getAllUsers();

    if (!users) {
      log.warn("No users found");
      return reply.status(404).send({ error: "No users found" });
    }

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: FIVE_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    log.info({ count: users.count }, "Fetched all users");

    return users;
  } catch (error) {
    log.error(error, "Failed to fetch all users");
    return reply.status(500).send({ error: "Internal server error" });
  }
}
