import { bootstrapDatabase } from "../bootstrapDatabase.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { migrateMock, queryMock } = vi.hoisted(() => ({
  migrateMock: vi.fn(),
  queryMock: vi.fn(),
}));

vi.mock("drizzle-orm/node-postgres/migrator", () => ({
  migrate: migrateMock,
}));

vi.mock("~/db/index.js", () => ({
  db: { name: "db-mock" },
  pool: {
    query: queryMock,
  },
}));

const expectedSchema = process.env.DATABASE_SCHEMA ?? "my_schema";

describe("bootstrapDatabase", () => {
  const logger = {
    info: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("runs pending migrations before seeding default users", async () => {
    await bootstrapDatabase(logger);

    expect(migrateMock).toHaveBeenCalledTimes(1);
    expect(migrateMock).toHaveBeenCalledWith(
      { name: "db-mock" },
      expect.objectContaining({
        migrationsFolder: expect.stringContaining("/drizzle"),
      }),
    );
    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(
        new RegExp(
          `CREATE TABLE IF NOT EXISTS "${expectedSchema}"."user_notification_preference"`,
        ),
      ),
    );
    expect(queryMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(
        new RegExp(`INSERT INTO "${expectedSchema}"."user"`),
      ),
    );
    expect(migrateMock.mock.invocationCallOrder[0]).toBeLessThan(
      queryMock.mock.invocationCallOrder[0],
    );
    expect(queryMock.mock.invocationCallOrder[0]).toBeLessThan(
      queryMock.mock.invocationCallOrder[1],
    );
  });

  test("emits progress logs for the bootstrap sequence", async () => {
    await bootstrapDatabase(logger);

    expect(logger.info).toHaveBeenNthCalledWith(
      1,
      "Running database migrations",
    );
    expect(logger.info).toHaveBeenNthCalledWith(
      2,
      "Repairing notification preference schema drift",
    );
    expect(logger.info).toHaveBeenNthCalledWith(
      3,
      "Ensuring default database users exist",
    );
    expect(logger.info).toHaveBeenNthCalledWith(
      4,
      "Database bootstrap complete",
    );
  });
});
