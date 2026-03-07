import {
  DrizzleLogger,
  betterAuthLogger,
  withRequestContext,
} from "../logging.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockPinoLogger, mockPinoFactory } = vi.hoisted(() => {
  const logger = {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  };

  return {
    mockPinoLogger: logger,
    mockPinoFactory: vi.fn(() => logger),
  };
});

vi.mock("~/config.js", () => ({
  default: {
    LOG_LEVEL: "info",
  },
}));

vi.mock("pino", () => ({
  default: mockPinoFactory,
}));

describe("logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("withRequestContext provides reqId to DrizzleLogger entries", async () => {
    const logger = new DrizzleLogger();

    await withRequestContext("req-123", async () => {
      logger.logQuery('select * from \\"users\\" where id = $1', ["u1"]);
      return Promise.resolve();
    });

    expect(mockPinoLogger.info).toHaveBeenCalledTimes(1);
    expect(mockPinoLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        reqId: "req-123",
        event: "drizzle_query",
        sql: 'select * from "users" where id = $1',
        params: ["u1"],
      }),
    );
  });

  test("DrizzleLogger logs without reqId outside request context", () => {
    const logger = new DrizzleLogger();

    logger.logQuery("select 1", []);

    expect(mockPinoLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        reqId: undefined,
        event: "drizzle_query",
        sql: "select 1",
      }),
    );
  });

  test("betterAuthLogger maps debug level and normalizes metadata", () => {
    betterAuthLogger.log("debug", "[Better Auth]: hello", {
      query: 'select * from \\"sessions\\"',
      module: "auth",
    });

    expect(mockPinoLogger.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "better_auth_debug",
        message: "[Better Auth]: hello",
        metadata: [
          {
            query: 'select * from "sessions"',
            module: "auth",
          },
        ],
      }),
    );
  });

  test("betterAuthLogger maps error level", () => {
    betterAuthLogger.log("error", "critical");

    expect(mockPinoLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "better_auth_error",
        message: "critical",
      }),
    );
  });

  test("betterAuthLogger maps non-debug non-error levels to info", () => {
    betterAuthLogger.log("warn", "warn message", { value: 1 });

    expect(mockPinoLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "better_auth_warn",
        message: "warn message",
        metadata: [{ value: 1 }],
      }),
    );
  });

  test("betterAuthLogger exports expected static configuration", () => {
    expect(betterAuthLogger.level).toBe("error");
    expect(betterAuthLogger.disabled).toBe(false);
  });
});
