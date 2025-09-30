import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserById } from "~/db/queries/index.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  ONE_HOUR,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export async function getUserHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:users:single",
  });

  // TODO: Check if the user has permission

  const { userId } = request.params;

  try {
    const user = await getUserById(userId);

    if (!user) {
      log.warn(`User with id ${userId} not found`);
      return reply.status(404).send({ error: "User not found" });
    }

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    log.info(`Fetched user with id ${userId} successfully`);

    return user;
  } catch (err) {
    log.error(err, `Failed to fetch user with id ${userId}`);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
