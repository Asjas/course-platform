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
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO "my_schema"."user"'),
    );
    expect(migrateMock.mock.invocationCallOrder[0]).toBeLessThan(
      queryMock.mock.invocationCallOrder[0],
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
      "Ensuring default database users exist",
    );
    expect(logger.info).toHaveBeenNthCalledWith(
      3,
      "Database bootstrap complete",
    );
  });
});
