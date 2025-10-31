import config from "../config.ts";
import { AsyncLocalStorage } from "async_hooks";
import pino from "pino";

// Create AsyncLocalStorage instance to store request context
const asyncLocalStorage = new AsyncLocalStorage<{ reqId?: string }>();

// Utility to run async operations with request context
export function withRequestContext<T>(
  reqId: string,
  callback: () => Promise<T>,
): Promise<T> {
  return asyncLocalStorage.run({ reqId }, callback);
}

export const pinoLogger = pino({
  level: config.LOG_LEVEL,
});

export const betterAuthLogger = {
  level: "error" as const,
  disabled: false,
  log: (level: string, message: string, ...args: unknown[]) => {
    const store = asyncLocalStorage.getStore();

    // Map Better Auth log levels to Pino levels
    const pinoLevel =
      level === "debug" ? "debug" : level === "error" ? "error" : "info";

    // Clean message to remove Better Auth formatting (e.g., "[Better Auth]:")
    // Based on issue with formatted messages[](https://github.com/better-auth/better-auth/issues/1115)
    const cleanMessage = message.replace(/^\[\w+\]:?\s*/, "").trim();

    // Clean query strings in metadata
    const cleanedMetadata = args.map((item) => {
      if (
        item &&
        typeof item === "object" &&
        "query" in item &&
        typeof item.query === "string"
      ) {
        return {
          ...item,
          query: item.query.replace(/\\"/g, '"'), // Remove backslashes from query
        };
      }
      return item;
    });

    pinoLogger[pinoLevel]({
      reqId: store?.reqId,
      event: `better_auth_${level}`,
      message: cleanMessage,
      metadata: cleanedMetadata,
      timestamp: new Date().toISOString(),
    });
  },
};
