import type { FastifyReply, FastifyRequest } from "fastify";

export async function getAllUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const log = request.log.child({
    reqId: request.id,
    routes: "handlers:users:get:all",
  });

  const fastify = reply.server;

  const [err, users] = await fastify.to(fastify.cache.getAllUsers());
  const count = users.length ?? 0;

  if (err) {
    log.error(err, "Failed to fetch all users");
    return reply.internalServerError();
  }

  reply.cacheControl("private");
  reply.cacheControl("max-age", "5m");
  reply.stale("if-error", "1h");
  reply.vary("Cookie");

  log.debug(`Fetched all ${count} users`);

  return { users, count };
}
