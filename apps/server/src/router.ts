import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "~/context.js";
import { FIVE_MINUTES, THIRTY_SECONDS, TWO_MINUTES } from "~/lib/constants.js";
import {
  trpcErrorCount,
  trpcProcedureCount,
  trpcProcedureDuration,
} from "~/lib/trpc-metrics.js";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  sse: {
    enabled: true,
    maxDurationMs: FIVE_MINUTES,
    ping: { enabled: true, intervalMs: THIRTY_SECONDS },
    client: { reconnectAfterInactivityMs: TWO_MINUTES },
  },
});

/**
 * Middleware to collect metrics for tRPC procedures.
 * Tracks request count, duration, and errors.
 */
const metricsMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = process.hrtime.bigint();

  const result = await next();

  const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
  const status = result.ok ? "success" : "error";

  trpcProcedureCount.inc({ path, type, status });
  trpcProcedureDuration.observe({ path, type }, durationSeconds);

  if (!result.ok && result.error) {
    trpcErrorCount.inc({ path, code: result.error.code });
  }

  return result;
});

export const router = t.router;
export const publicProcedure = t.procedure.use(metricsMiddleware);

// Middleware section
export const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this endpoint",
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

  const userId =
    (input as Record<"userId", string>)?.userId ||
    (input as Record<"id", string>)?.id;

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

export const isOwnerOrAdmin = t.middleware(({ ctx, next, input }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }

  const userId =
    (input as Record<"userId", string>)?.userId ||
    (input as Record<"id", string>)?.id;

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
      message: "You can only access your own account or you must be an admin",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});
