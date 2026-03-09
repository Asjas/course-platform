import { describe, expect, it } from "vitest";
import { getBackendErrorMessage, isAccessDeniedError } from "~/lib/api-error";

describe("api-error", () => {
  it("prefers shape.message over message and fallback", () => {
    const error = {
      message: "Top-level",
      shape: { message: "Shape-level" },
    };

    expect(getBackendErrorMessage(error, "Fallback")).toBe("Shape-level");
  });

  it("returns fallback for unknown or empty error shapes", () => {
    expect(getBackendErrorMessage(null, "Fallback")).toBe("Fallback");
    expect(getBackendErrorMessage({ message: "   " }, "Fallback")).toBe(
      "Fallback",
    );
  });

  it("identifies access denied errors from error code", () => {
    expect(isAccessDeniedError({ data: { code: "FORBIDDEN" } })).toBe(true);
    expect(
      isAccessDeniedError({ shape: { data: { code: "UNAUTHORIZED" } } }),
    ).toBe(true);
  });

  it("identifies access denied errors from message content", () => {
    expect(
      isAccessDeniedError({ message: "Access denied for this action" }),
    ).toBe(true);
    expect(isAccessDeniedError({ message: "Permission is required" })).toBe(
      true,
    );
    expect(isAccessDeniedError({ message: "Other error" })).toBe(false);
  });
});
