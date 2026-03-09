import { imagesRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockGeneratePresignedUploadUrl,
  mockDeleteR2Object,
  mockObserve,
  mockInc,
} = vi.hoisted(() => ({
  mockGeneratePresignedUploadUrl: vi.fn(),
  mockDeleteR2Object: vi.fn(),
  mockObserve: vi.fn(),
  mockInc: vi.fn(),
}));

vi.mock("~/lib/r2-upload.js", () => ({
  generatePresignedUploadUrl: mockGeneratePresignedUploadUrl,
  deleteR2Object: mockDeleteR2Object,
}));

vi.mock("~/lib/external-metrics.js", () => ({
  externalServiceDuration: { observe: mockObserve },
  externalServiceCount: { inc: mockInc },
  externalServiceErrors: { inc: mockInc },
}));

interface TestUser {
  id: string;
  role: string;
}

function createCaller(user?: TestUser) {
  const log = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  };

  const caller = imagesRouter.createCaller({
    user,
    hasRole: (role: string) => user?.role === role,
    reply: { server: { log } },
  } as never);

  return { caller, log };
}

describe("imagesRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getPresignedUrl rejects unauthenticated callers", async () => {
    const { caller } = createCaller();

    await expect(
      caller.getPresignedUrl({
        key: "uploads/a.png",
        contentType: "image/png",
      }),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this endpoint",
    });
  });

  test("getPresignedUrl returns signed upload URLs", async () => {
    const { caller } = createCaller({ id: "user-1", role: "student" });
    mockGeneratePresignedUploadUrl.mockResolvedValue({
      presignedUrl: "https://r2.example/upload",
      publicUrl: "https://cdn.example/uploads/a.png",
    });

    const result = await caller.getPresignedUrl({
      key: "uploads/a.png",
      contentType: "image/png",
    });

    expect(result).toEqual({
      presignedUrl: "https://r2.example/upload",
      publicUrl: "https://cdn.example/uploads/a.png",
    });
  });

  test("deleteImage deletes object and returns success", async () => {
    const { caller } = createCaller({ id: "user-1", role: "student" });
    mockDeleteR2Object.mockResolvedValue(undefined);

    const result = await caller.deleteImage({ key: "uploads/a.png" });

    expect(mockDeleteR2Object).toHaveBeenCalledWith("uploads/a.png");
    expect(result).toEqual({ success: true });
  });

  test("deleteImage propagates provider errors", async () => {
    const { caller } = createCaller({ id: "user-1", role: "student" });
    mockDeleteR2Object.mockRejectedValue(new Error("r2 unavailable"));

    await expect(caller.deleteImage({ key: "uploads/a.png" })).rejects.toThrow(
      "r2 unavailable",
    );
  });
});
