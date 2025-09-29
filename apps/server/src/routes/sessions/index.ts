import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
} from "fastify";
import {
  deleteSessionByToken,
  deleteSessionByUserId,
} from "~/db/mutations/session.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "routes:sessions:private" });

export default function sessionRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.delete(
    "/sessions/token/:token",
    async (request: FastifyRequest<{ Params: { token: string } }>, reply) => {
      const { token } = request.params;

      try {
        const deleted = await deleteSessionByToken(token);

        if (!deleted) {
          log.warn({ token }, "Session not found for deletion");
          return reply.status(404).send({ error: "Session not found" });
        }

        log.info({ token }, "Session deleted by token");

        return reply.status(204).send();
      } catch (error) {
        log.error({ error, token }, "Error deleting session by token");
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.delete(
    "/sessions/user/:userId",
    async (request: FastifyRequest<{ Params: { userId: string } }>, reply) => {
      const { userId } = request.params;

      try {
        const deleted = await deleteSessionByUserId(userId);

        if (!deleted) {
          log.warn({ userId }, "Sessions not found for deletion");
          return reply.status(404).send({ error: "Sessions not found" });
        }

        log.info({ userId }, "Sessions deleted by user ID");

        return reply.status(204).send();
      } catch (error) {
        log.error({ error, userId }, "Error deleting sessions by user ID");
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  done();
}
