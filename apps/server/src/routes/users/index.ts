import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import { deleteUserHandler } from "~/routes/users/handlers/deleteUser.js";
import { getUserHandler } from "~/routes/users/handlers/getUser.js";
import { getUsersHandler } from "~/routes/users/handlers/getUsers.js";
import { updateUserHandler } from "~/routes/users/handlers/updateUser.js";

export default function usersRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.get("/users", getUsersHandler);
  fastify.get("/users/:userId", getUserHandler);
  fastify.put("/users/:userId", updateUserHandler);
  fastify.delete("/users/:userId", deleteUserHandler);

  done();
}
