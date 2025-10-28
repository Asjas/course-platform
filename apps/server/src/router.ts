import { TRPCError, initTRPC } from "@trpc/server";
import type { Context } from "~/context.js";

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware section
export const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.hasRole("admin")) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to access this resource",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const isOwner = t.middleware(({ ctx, next, input }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }

  const userId = (input as Record<"id", string>)?.id;

  if (!userId || typeof userId !== "string") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User ID is required",
    });
  }

  if (ctx.user.id !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not authorized to access this resource",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const isOwnerOrAdmin = t.middleware(({ ctx, next, input }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }

  const userId = (input as Record<"id", string>)?.id;

  if (!userId || typeof userId !== "string") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid user ID",
    });
  }

  const isOwner = ctx.user.id === userId;
  const isAdmin = ctx.hasRole("admin");

  if (!isOwner && !isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can only delete your own account or must be an admin",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});
