import type {
  DoneFuncWithErrOrRes,
  FastifyReply,
  FastifyRequest,
} from "fastify";

export const auth = async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: DoneFuncWithErrOrRes,
) => {
  // TODO: Verify token and set request.user

  if (!request.headers.authorization) {
    throw reply.unauthorized();
  }

  if (request.user?.id === "ghost" || request.user?.banned) {
    throw reply.forbidden();
  }

  done();
};

export const isAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: DoneFuncWithErrOrRes,
) => {
  if (request.user?.role !== "admin") {
    throw reply.forbidden();
  }

  done();
};
