import { TRPCError } from "@trpc/server";

// Simple in-memory rate limiter for data exports
// In production, this should use Redis for distributed rate limiting
const exportAttempts = new Map<string, number>();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_EXPORTS_PER_WINDOW = 3; // Max 3 exports per hour

/**
 * Check if user has exceeded rate limit for data exports
 * Throws TRPCError if rate limit exceeded
 */
export function checkExportRateLimit(userId: string): void {
  const now = Date.now();
  const userKey = `export:${userId}`;

  // Clean up old entries periodically
  if (exportAttempts.size > 1000) {
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    for (const [key, timestamp] of exportAttempts.entries()) {
      if (timestamp < cutoff) {
        exportAttempts.delete(key);
      }
    }
  }

  const lastAttempt = exportAttempts.get(userKey);

  if (lastAttempt && now - lastAttempt < RATE_LIMIT_WINDOW_MS) {
    // Count attempts in the current window
    const attempts = Array.from(exportAttempts.entries()).filter(
      ([key, timestamp]) =>
        key.startsWith(`export:${userId}:`) &&
        now - timestamp < RATE_LIMIT_WINDOW_MS,
    ).length;

    if (attempts >= MAX_EXPORTS_PER_WINDOW) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. You can export your data up to ${MAX_EXPORTS_PER_WINDOW} times per hour. Please try again later.`,
      });
    }
  }

  // Record this attempt
  const attemptKey = `export:${userId}:${now}`;
  exportAttempts.set(attemptKey, now);
  exportAttempts.set(userKey, now);
}
