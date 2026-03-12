import { getAllEarlySignups, getEarlySignupById } from "../queries.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      earlySignup: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecute,
          }),
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecute,
          }),
        }),
      },
    },
  },
}));

describe("getAllEarlySignups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAllEarlySignups).toBe("function");
  });

  test("returns an array of signups", async () => {
    const mockSignups = [
      {
        id: "signup:1",
        email: "alice@example.com",
        name: "Alice",
        source: "learnfastify",
        referrer: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        confirmedAt: null,
        unsubscribedAt: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: "signup:2",
        email: "bob@example.com",
        name: null,
        source: "codewizard",
        referrer: "twitter",
        utmSource: "twitter",
        utmMedium: "social",
        utmCampaign: "launch",
        confirmedAt: new Date("2024-01-05"),
        unsubscribedAt: null,
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-05"),
      },
    ];
    mockExecute.mockResolvedValueOnce(mockSignups);
    const result = await getAllEarlySignups();
    expect(result).toEqual(mockSignups);
    expect(result).toHaveLength(2);
  });

  test("returns empty array when no signups exist", async () => {
    mockExecute.mockResolvedValueOnce([]);
    const result = await getAllEarlySignups();
    expect(result).toEqual([]);
  });
});

describe("getEarlySignupById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getEarlySignupById).toBe("function");
  });

  test("returns a signup when found", async () => {
    const mockSignup = {
      id: "signup:1",
      email: "alice@example.com",
      name: "Alice",
      source: "learnfastify",
      confirmedAt: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };
    mockExecute.mockResolvedValueOnce(mockSignup);
    const result = await getEarlySignupById({ id: "signup:1" });
    expect(result).toEqual(mockSignup);
  });

  test("returns null when signup not found", async () => {
    mockExecute.mockResolvedValueOnce(null);
    const result = await getEarlySignupById({ id: "nonexistent" });
    expect(result).toBeNull();
  });

  test("passes id to execute", async () => {
    mockExecute.mockResolvedValueOnce(null);
    await getEarlySignupById({ id: "signup:abc" });
    expect(mockExecute).toHaveBeenCalledWith({ id: "signup:abc" });
  });
});
