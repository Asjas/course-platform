import { describe, expect, it } from "vitest";
import {
  buildCourseWishlistVerifyUrl,
  getVerificationStatusConfig,
  resolveVerificationStatus,
} from "~/lib/verify-course-wishlist";

describe("verify-course-wishlist helpers", () => {
  it("defaults missing status to invalid", () => {
    expect(resolveVerificationStatus(undefined)).toBe("invalid");
  });

  it("returns provided status when present", () => {
    expect(resolveVerificationStatus("verified")).toBe("verified");
  });

  it("builds API verification URL with token query", () => {
    expect(
      buildCourseWishlistVerifyUrl("https://api.codewizard.training", "abc123"),
    ).toBe(
      "https://api.codewizard.training/verify-course-wishlist?token=abc123",
    );
  });

  it("returns the correct copy for verified status", () => {
    const config = getVerificationStatusConfig("verified");

    expect(config.title).toBe("You're verified");
    expect(config.description).toContain("early signup is confirmed");
  });
});
