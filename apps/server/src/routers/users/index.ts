import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { publicProcedure, router } from "~/router.js";
import { deleteUserById, updateUserById } from "~/routers/users/mutations.js";
import { getAllUsers, getUserById } from "~/routers/users/queries.js";

type UsersReturnType = Awaited<ReturnType<typeof getAllUsers>>;
type UserByIdReturnType = Awaited<ReturnType<typeof getUserById>>;

export const usersRouter = router({
  getAllUsers: publicProcedure.query(
    async ({ ctx }): Promise<UsersReturnType> => {
      if (!ctx.user || !ctx.hasRole("admin")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource",
        });
      }

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
    },
  ),
  getUserById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input: { userId } }): Promise<UserByIdReturnType> => {
      if (!ctx.user || ctx.user.id !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource",
        });
      }

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
  updateUserById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim(),
        username: z.string().trim().nullable(),
        email: z.email().trim(),
        metadata: z.string().trim().nullable(),
        country: z.string().trim().nullable(),
        image: z
          .string()
          .nullable()
          .refine(
            (value) => {
              if (!value) return true;

              try {
                Buffer.from(value, "base64");
                return true;
              } catch {
                return false;
              }
            },
            { message: "Invalid base64 string" },
          ),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<UserByIdReturnType> => {
      if (!ctx.user || ctx.user.id !== input.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource",
        });
      }

      const fastify = ctx.reply.server;

      const [err, updatedUser] = await fastify.to(
        updateUserById({ userId: input.id, updates: input }),
      );

      if (err) {
        ctx.request.log.error(err, `Error updating user with id ${input.id}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      ctx.reply.server.cache.invalidateAll([input.id, "users~all"]);

      return updatedUser;
    }),
  deleteUserById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input: { userId } }): Promise<void> => {
      if (!ctx.user || ctx.user.id !== userId || ctx.hasRole("admin")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource",
        });
      }

      const fastify = ctx.reply.server;

      const [err] = await fastify.to(deleteUserById({ userId }));

      if (err) {
        ctx.request.log.error(err, `Error deleting user with id ${userId}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      ctx.reply.server.cache.invalidateAll([userId, "users~all"]);
    }),
  banUserById: publicProcedure
    .input(z.object({ userId: z.string(), banReason: z.string().optional() }))
    .mutation(
      async ({
        ctx,
        input: { userId, banReason },
      }): Promise<UserByIdReturnType> => {
        if (!ctx.user || !ctx.hasRole("admin")) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not authorized to access this resource",
          });
        }

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
    .mutation(
      async ({ ctx, input: { userId } }): Promise<UserByIdReturnType> => {
        if (!ctx.user || !ctx.hasRole("admin")) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not authorized to access this resource",
          });
        }

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
