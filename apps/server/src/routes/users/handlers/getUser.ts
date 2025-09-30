import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserById } from "~/db/queries/index.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  ONE_HOUR,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export async function getUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:users:single",
  });

  const { id: userId } = request.params;

  try {
    const user = await getUserById(userId);

    if (!user) {
      log.warn({ userId }, "User not found");
      return reply.status(404).send({ error: "User not found" });
    }

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    log.info({ userId }, "Fetched user successfully");

    return user;
  } catch (err) {
    log.error({ err, userId }, "Failed to fetch user");
    return reply.status(500).send({ error: "Internal server error" });
  }
}
