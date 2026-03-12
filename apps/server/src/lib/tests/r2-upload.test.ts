import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockSend, mockGetSignedUrl } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({}),
  mockGetSignedUrl: vi
    .fn()
    .mockResolvedValue("https://presigned.example.com/file.png"),
}));

let s3ClientConstructorArgs: unknown[] = [];

vi.mock("@aws-sdk/client-s3", () => {
  class MockS3Client {
    send = mockSend;
    constructor(...args: unknown[]) {
      s3ClientConstructorArgs = args;
    }
  }
  class MockPutObjectCommand {
    Bucket: string;
    Key: string;
    ContentType?: string;
    constructor(args: { Bucket: string; Key: string; ContentType?: string }) {
      this.Bucket = args.Bucket;
      this.Key = args.Key;
      this.ContentType = args.ContentType;
    }
  }
  class MockDeleteObjectCommand {
    Bucket: string;
    Key: string;
    constructor(args: { Bucket: string; Key: string }) {
      this.Bucket = args.Bucket;
      this.Key = args.Key;
    }
  }
  return {
    S3Client: MockS3Client,
    PutObjectCommand: MockPutObjectCommand,
    DeleteObjectCommand: MockDeleteObjectCommand,
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mockGetSignedUrl,
}));

vi.mock("~/config.js", () => ({
  default: {
    R2_ENDPOINT: "https://r2.example.com",
    R2_ACCESS_KEY_ID: "test-access-key",
    R2_SECRET_ACCESS_KEY: "test-secret-key",
    R2_BUCKET_NAME: "test-bucket",
    R2_PUBLIC_URL: "https://cdn.example.com",
  },
}));

vi.mock("~/lib/constants.js", () => ({
  ONE_HOUR: 3600,
}));

describe("r2-upload", () => {
  let r2Module: typeof import("../r2-upload.js");

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetSignedUrl.mockResolvedValue(
      "https://presigned.example.com/file.png",
    );
    r2Module = await import("../r2-upload.js");
  });

  test("generatePresignedUploadUrl returns presigned and public URLs", async () => {
    const result = await r2Module.generatePresignedUploadUrl({
      key: "uploads/image.png",
      contentType: "image/png",
    });

    expect(result.presignedUrl).toBe("https://presigned.example.com/file.png");
    expect(result.publicUrl).toBe("https://cdn.example.com/uploads/image.png");
  });

  test("generatePresignedUploadUrl calls getSignedUrl with expiry", async () => {
    await r2Module.generatePresignedUploadUrl({
      key: "uploads/doc.pdf",
      contentType: "application/pdf",
    });

    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ expiresIn: 3600 }),
    );
  });

  test("deleteR2Object sends a command via the S3 client", async () => {
    await r2Module.deleteR2Object("uploads/old-file.png");

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "test-bucket",
        Key: "uploads/old-file.png",
      }),
    );
  });

  test("S3Client is created with auto region and R2 endpoint", () => {
    expect(s3ClientConstructorArgs[0]).toEqual(
      expect.objectContaining({
        region: "auto",
        endpoint: "https://r2.example.com",
        credentials: {
          accessKeyId: "test-access-key",
          secretAccessKey: "test-secret-key",
        },
      }),
    );
  });
});
