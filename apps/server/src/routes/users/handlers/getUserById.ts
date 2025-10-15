import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserById } from "~/db/queries/index.js";

export async function getUserByIdHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:users:single",
  });

  const { userId } = request.params;

  try {
    const user = await getUserById({ userId });

    if (!user) {
      log.debug(`User with id ${userId} not found`);
      return reply.notFound("User not found");
    }

    reply.cacheControl("private");
    reply.cacheControl("max-age", "5m");
    reply.stale("if-error", "1h");
    reply.vary("Authorization");

    log.debug(`Fetched user with id ${userId} successfully`);

    return user;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to fetch user with id ${userId}`);
    }

    return reply.internalServerError();
  }
}
