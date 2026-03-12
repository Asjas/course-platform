import {
  deleteTeamLicenseInviteById,
  insertTeamLicenseInvite,
  updateTeamLicenseInviteById,
} from "../teamLicenseInvite.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockReturning } = vi.hoisted(() => ({
  mockReturning: vi.fn(),
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
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: mockReturning,
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: mockReturning,
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: mockReturning,
      }),
    }),
  },
}));

vi.mock("~/db/schema/teamLicense.js", () => ({
  teamLicenseInvite: {
    id: "id",
    licenseId: "licenseId",
  },
}));

describe("insertTeamLicenseInvite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof insertTeamLicenseInvite).toBe("function");
  });

  test("inserts a new team license invite and returns it", async () => {
    const newInvite = {
      id: "tli:1",
      licenseId: "tl:1",
      email: "invited@example.com",
    };
    mockReturning.mockResolvedValueOnce([newInvite]);

    const result = await insertTeamLicenseInvite(newInvite as never);
    expect(result).toEqual([newInvite]);
  });

  test("throws when insert fails", async () => {
    mockReturning.mockRejectedValueOnce(new Error("Duplicate invite"));

    await expect(
      insertTeamLicenseInvite({ id: "tli:dup" } as never),
    ).rejects.toThrow("Duplicate invite");
  });
});

describe("updateTeamLicenseInviteById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("updates invite and returns updated record", async () => {
    const updated = {
      id: "tli:1",
      acceptedAt: new Date().toISOString(),
    };
    mockReturning.mockResolvedValueOnce([updated]);

    const result = await updateTeamLicenseInviteById({
      teamLicenseId: "tli:1",
      updates: { acceptedAt: updated.acceptedAt } as never,
    });
    expect(result).toEqual([updated]);
  });

  test("returns empty array when invite not found", async () => {
    mockReturning.mockResolvedValueOnce([]);

    const result = await updateTeamLicenseInviteById({
      teamLicenseId: "tli:nonexistent",
      updates: {} as never,
    });
    expect(result).toEqual([]);
  });

  test("throws when update fails", async () => {
    mockReturning.mockRejectedValueOnce(new Error("Update error"));

    await expect(
      updateTeamLicenseInviteById({
        teamLicenseId: "tli:1",
        updates: {} as never,
      }),
    ).rejects.toThrow("Update error");
  });
});

describe("deleteTeamLicenseInviteById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("deletes invite and returns deleted ID", async () => {
    mockReturning.mockResolvedValueOnce([{ id: "tli:1" }]);

    const result = await deleteTeamLicenseInviteById({
      teamLicenseId: "tl:1",
      teamLicenseInviteId: "tli:1",
    });
    expect(result).toBeDefined();
  });

  test("returns empty when invite not found for the license", async () => {
    mockReturning.mockResolvedValueOnce([]);

    const result = await deleteTeamLicenseInviteById({
      teamLicenseId: "tl:wrong",
      teamLicenseInviteId: "tli:1",
    });
    expect(result).toEqual([]);
  });

  test("throws when delete fails", async () => {
    mockReturning.mockRejectedValueOnce(new Error("Delete error"));

    await expect(
      deleteTeamLicenseInviteById({
        teamLicenseId: "tl:1",
        teamLicenseInviteId: "tli:1",
      }),
    ).rejects.toThrow("Delete error");
  });
});
