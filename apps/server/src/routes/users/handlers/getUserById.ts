import type { FastifyReply, FastifyRequest } from "fastify";

export async function getUserByIdHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:users:get:id",
  });

  const fastify = reply.server;
  const { userId } = request.params;

  const [err, user] = await fastify.to(
    fastify.cache.getUserById({
      userId,
    }),
  );

  if (err) {
    log.error(err, `Failed to fetch user with id ${userId}`);
    return reply.internalServerError();
  }

  if (!user) {
    log.debug(`User with id ${userId} not found`);
    return reply.notFound("User not found");
  }

  reply.cacheControl("private");
  reply.cacheControl("max-age", "5m");
  reply.stale("if-error", "1h");
  reply.vary("Cookie");

  log.debug(`Fetched user with id ${user.id} successfully`);

  return user;
}
