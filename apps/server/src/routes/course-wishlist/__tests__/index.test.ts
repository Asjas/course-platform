import courseWishlistRoutes from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  confirmCourseWishlistEntry,
  markCourseWishlistVerificationTokenUsed,
} from "~/db/mutations/courseWishlist.js";
import {
  getCourseWishlistById,
  getCourseWishlistVerificationTokenByToken,
} from "~/db/queries/courseWishlist.js";

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: () => ({
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

vi.mock("~/db/queries/courseWishlist.js", () => ({
  getCourseWishlistById: vi.fn(),
  getCourseWishlistVerificationTokenByToken: vi.fn(),
}));

vi.mock("~/db/mutations/courseWishlist.js", () => ({
  confirmCourseWishlistEntry: vi.fn(),
  markCourseWishlistVerificationTokenUsed: vi.fn(),
}));

const mockGetCourseWishlistById = vi.mocked(getCourseWishlistById);
const mockGetCourseWishlistVerificationTokenByToken = vi.mocked(
  getCourseWishlistVerificationTokenByToken,
);
const mockConfirmCourseWishlistEntry = vi.mocked(confirmCourseWishlistEntry);
const mockMarkCourseWishlistVerificationTokenUsed = vi.mocked(
  markCourseWishlistVerificationTokenUsed,
);

interface ReplyMock {
  redirect: ReturnType<typeof vi.fn>;
}

type VerifyHandler = (
  request: { query: { token?: string } },
  reply: ReplyMock,
) => Promise<unknown>;

function createReplyMock(): ReplyMock {
  return {
    redirect: vi.fn(),
  };
}

function setupRouteHandler() {
  let capturedHandler: VerifyHandler | null = null;

  const fastify = {
    config: {
      ORIGIN: [
        "https://api.codewizard.training",
        "https://codewizard.training",
      ],
    },
    get: vi.fn((path, routeHandler: VerifyHandler) => {
      if (path === "/verify-course-wishlist") {
        capturedHandler = routeHandler;
      }
    }),
  };

  const done = vi.fn();
  courseWishlistRoutes(fastify as never, {} as never, done as never);

  if (!capturedHandler) {
    throw new Error("Verification route handler was not registered");
  }

  return { handler: capturedHandler as VerifyHandler, done };
}

describe("courseWishlistRoutes /verify-course-wishlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("redirects to invalid status when token is missing", async () => {
    const { handler } = setupRouteHandler();
    const reply = createReplyMock();

    await handler({ query: {} }, reply);

    expect(reply.redirect).toHaveBeenCalledWith(
      "https://codewizard.training/verify-course-wishlist?status=invalid",
      302,
    );
  });

  test("redirects to used status when token was already consumed", async () => {
    const { handler } = setupRouteHandler();
    const reply = createReplyMock();

    mockGetCourseWishlistVerificationTokenByToken.mockResolvedValueOnce({
      id: "token:1",
      wishlistId: "wishlist:1",
      tokenHash: "hash",
      usedAt: new Date("2026-01-10T00:00:00.000Z"),
      expiresAt: new Date("2026-12-10T00:00:00.000Z"),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    await handler({ query: { token: "abc" } }, reply);

    expect(reply.redirect).toHaveBeenCalledWith(
      "https://codewizard.training/verify-course-wishlist?status=used",
      302,
    );
  });

  test("redirects to expired status for expired token", async () => {
    const { handler } = setupRouteHandler();
    const reply = createReplyMock();

    mockGetCourseWishlistVerificationTokenByToken.mockResolvedValueOnce({
      id: "token:1",
      wishlistId: "wishlist:1",
      tokenHash: "hash",
      usedAt: null,
      expiresAt: new Date(Date.now() - 60_000),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    await handler({ query: { token: "abc" } }, reply);

    expect(reply.redirect).toHaveBeenCalledWith(
      "https://codewizard.training/verify-course-wishlist?status=expired",
      302,
    );
  });

  test("confirms wishlist and consumes token when valid", async () => {
    const { handler } = setupRouteHandler();
    const reply = createReplyMock();

    mockGetCourseWishlistVerificationTokenByToken.mockResolvedValueOnce({
      id: "token:1",
      wishlistId: "wishlist:1",
      tokenHash: "hash",
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    mockGetCourseWishlistById.mockResolvedValueOnce({
      id: "wishlist:1",
      email: "person@example.com",
      userId: null,
      name: null,
      courseId: "course:1",
      referrer: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      confirmedAt: null,
      unsubscribedAt: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    await handler({ query: { token: "abc" } }, reply);

    expect(mockConfirmCourseWishlistEntry).toHaveBeenCalledWith("wishlist:1");
    expect(mockMarkCourseWishlistVerificationTokenUsed).toHaveBeenCalledWith(
      "token:1",
    );
    expect(reply.redirect).toHaveBeenCalledWith(
      "https://codewizard.training/verify-course-wishlist?status=verified",
      302,
    );
  });

  test("redirects to error status when verification throws", async () => {
    const { handler } = setupRouteHandler();
    const reply = createReplyMock();

    mockGetCourseWishlistVerificationTokenByToken.mockRejectedValueOnce(
      new Error("db failure"),
    );

    await handler({ query: { token: "abc" } }, reply);

    expect(reply.redirect).toHaveBeenCalledWith(
      "https://codewizard.training/verify-course-wishlist?status=error",
      302,
    );
  });
});
