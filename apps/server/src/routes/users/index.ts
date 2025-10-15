import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import { deleteUserByIdHandler } from "~/routes/users/handlers/deleteUserById.js";
import { getAllUsersHandler } from "~/routes/users/handlers/getAllUsers.js";
import { getUserByIdHandler } from "~/routes/users/handlers/getUserById.js";
import { updateUserByIdHandler } from "~/routes/users/handlers/updateUserById.js";

export default function usersRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.get("/users", getAllUsersHandler);
  fastify.get("/users/id/:userId", getUserByIdHandler);
  fastify.put("/users/id/:userId", updateUserByIdHandler);
  fastify.delete("/users/id/:userId", deleteUserByIdHandler);

  done();
}
