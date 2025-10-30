import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { isAdmin, isOwnerOrAdmin, publicProcedure, router } from "~/router.js";
import { updateUserById } from "~/routers/users/mutations.js";
import type {
  UserByIdReturnType,
  UsersReturnType,
} from "~/routers/users/queries.js";

export const usersRouter = router({
  getAllUsers: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<UsersReturnType> => {
      const fastify = ctx.reply.server;

      const [err, users] = await fastify.to(fastify.cache.getAllUsers());

      if (err) {
        ctx.request.log.error(err, "Failed to fetch all users");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return users;
    }),
  getUserById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .use(isOwnerOrAdmin)
    .query(async ({ ctx, input: { userId } }): Promise<UserByIdReturnType> => {
      const fastify = ctx.reply.server;

      const [err, user] = await fastify.to(
        fastify.cache.getUserById({ userId }),
      );

      if (err) {
        ctx.request.log.error(err, `Failed to fetch user with id ${userId}`);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      if (!user) {
        ctx.request.log.debug(`User with id ${userId} not found`);

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      ctx.request.log.debug(`Fetched user with id ${user.id} successfully`);

      return user;
    }),
  banUserById: publicProcedure
    .input(z.object({ userId: z.string(), banReason: z.string().optional() }))
    .use(isAdmin)
    .mutation(
      async ({
        ctx,
        input: { userId, banReason },
      }): Promise<UserByIdReturnType> => {
        const fastify = ctx.reply.server;

        const [err, bannedUser] = await fastify.to(
          updateUserById({
            userId,
            updates: { banned: true, banReason },
          }),
        );

        if (err) {
          ctx.request.log.error(err, `Error banning user with id ${userId}`);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          });
        }

        ctx.reply.server.cache.invalidateAll([userId, "users~all"]);

        return bannedUser;
      },
    ),
  unbanUserById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .use(isAdmin)
    .mutation(
      async ({ ctx, input: { userId } }): Promise<UserByIdReturnType> => {
        const fastify = ctx.reply.server;

        const [err, unbannedUser] = await fastify.to(
          updateUserById({ userId, updates: { banned: false } }),
        );

        if (err) {
          ctx.request.log.error(err, `Error unbanning user with id ${userId}`);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          });
        }

        ctx.reply.server.cache.invalidateAll([userId, "users~all"]);

        return unbannedUser;
      },
    ),
});
