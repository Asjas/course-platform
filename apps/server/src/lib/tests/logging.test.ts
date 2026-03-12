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

  test("betterAuthLogger passes non-object metadata items through unchanged", () => {
    betterAuthLogger.log("debug", "msg", "plain-string", 42, null);

    expect(mockPinoLogger.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: ["plain-string", 42, null],
      }),
    );
  });

  test("betterAuthLogger handles metadata objects without a query property", () => {
    betterAuthLogger.log("info", "msg", { module: "session", count: 5 });

    expect(mockPinoLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: [{ module: "session", count: 5 }],
      }),
    );
  });

  test("DrizzleLogger includes timestamp in log entries", () => {
    const logger = new DrizzleLogger();
    logger.logQuery("select 1", []);

    expect(mockPinoLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      }),
    );
  });

  test("withRequestContext isolates reqId per async context", async () => {
    const logger = new DrizzleLogger();

    await Promise.all([
      withRequestContext("req-A", async () => {
        logger.logQuery("query A", []);
        return Promise.resolve();
      }),
      withRequestContext("req-B", async () => {
        logger.logQuery("query B", []);
        return Promise.resolve();
      }),
    ]);

    const calls = mockPinoLogger.info.mock.calls as Record<string, unknown>[][];
    const reqIds = calls.map((c) => c[0].reqId);
    expect(reqIds).toContain("req-A");
    expect(reqIds).toContain("req-B");
  });
});
