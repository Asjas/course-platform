import { getAllTeamLicenses, getTeamLicenseById } from "../teamLicense.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: vi.fn().mockReturnValue({
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    }),
  },
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      teamLicense: {
        findMany: vi.fn().mockReturnValue({
          prepare: vi.fn().mockReturnValue({ execute: mockExecute }),
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: vi.fn().mockReturnValue({ execute: mockExecute }),
        }),
      },
    },
  },
}));

describe("getAllTeamLicenses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAllTeamLicenses).toBe("function");
  });

  test("returns team licenses with count on success", async () => {
    const mockLicenses = [
      { id: "tl:1", seats: 10, purchaserId: "user:1" },
      { id: "tl:2", seats: 5, purchaserId: "user:2" },
    ];
    mockExecute.mockResolvedValueOnce(mockLicenses);

    const result = await getAllTeamLicenses();
    expect(result.teamLicenses).toEqual(mockLicenses);
    expect(result.count).toBe(2);
  });

  test("returns empty array when no licenses exist", async () => {
    mockExecute.mockResolvedValueOnce([]);

    const result = await getAllTeamLicenses();
    expect(result.teamLicenses).toEqual([]);
    expect(result.count).toBe(0);
  });

  test("throws when database query fails", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB unavailable"));

    await expect(getAllTeamLicenses()).rejects.toThrow("DB unavailable");
  });
});

describe("getTeamLicenseById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns team license when found", async () => {
    const mockLicense = {
      id: "tl:1",
      seats: 10,
      purchaserId: "user:1",
      course: { id: "course:1", title: "Fastify" },
    };
    mockExecute.mockResolvedValueOnce(mockLicense);

    const result = await getTeamLicenseById("tl:1");
    expect(result).toEqual(mockLicense);
  });

  test("returns null when team license not found", async () => {
    mockExecute.mockResolvedValueOnce(undefined);

    const result = await getTeamLicenseById("tl:nonexistent");
    expect(result).toBeNull();
  });

  test("throws when database query fails", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Connection timeout"));

    await expect(getTeamLicenseById("tl:1")).rejects.toThrow(
      "Connection timeout",
    );
  });
});
