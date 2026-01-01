import { TRPCError } from "@trpc/server";
import { redis } from "~/lib/redis.js";

// Rate limiting configuration for data exports using Fastify's rate limit approach
const RATE_LIMIT_WINDOW_SEC = 60 * 60; // 1 hour in seconds
const MAX_EXPORTS_PER_WINDOW = 3; // Max 3 exports per hour

/**
 * Check if user has exceeded rate limit for data exports
 * Uses Redis (same as Fastify's @fastify/rate-limit plugin) for distributed rate limiting
 * Throws TRPCError if rate limit exceeded
 */
export async function checkExportRateLimit(userId: string): Promise<void> {
  const key = `codewizard-rate-limit-data-export:${userId}`;

  try {
    // Increment the counter and get the current value
    const count = await redis.incr(key);

    // Set expiry on first request (when count is 1)
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW_SEC);
    }

    // Check if limit exceeded
    if (count > MAX_EXPORTS_PER_WINDOW) {
      // Get TTL to inform user when they can try again
      const ttl = await redis.ttl(key);
      const minutesLeft = Math.ceil(ttl / 60);

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. You can export your data up to ${MAX_EXPORTS_PER_WINDOW} times per hour. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
      });
    }
  } catch (error) {
    // If it's already a TRPCError (rate limit exceeded), rethrow it
    if (error instanceof TRPCError) {
      throw error;
    }

    // For Redis connection errors, log but don't block the export
    // This ensures the feature works even if Redis is temporarily unavailable
    console.error("Rate limit check failed (Redis error):", error);
  }
}
