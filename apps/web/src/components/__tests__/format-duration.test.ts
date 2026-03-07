import { describe, expect, test } from "vitest";
import { formatDuration } from "~/components/course-card";

describe("formatDuration", () => {
  test("formats seconds to minutes only", () => {
    expect(formatDuration(300)).toBe("5m");
  });

  test("formats zero seconds to 0m", () => {
    expect(formatDuration(0)).toBe("0m");
  });

  test("formats seconds to hours and minutes", () => {
    expect(formatDuration(3660)).toBe("1h 1m");
  });

  test("formats exact hour with 0 minutes", () => {
    expect(formatDuration(3600)).toBe("1h 0m");
  });

  test("formats multiple hours", () => {
    expect(formatDuration(7200 + 1800)).toBe("2h 30m");
  });

  test("rounds down partial minutes", () => {
    expect(formatDuration(90)).toBe("1m");
    expect(formatDuration(119)).toBe("1m");
  });

  test("formats less than 60 seconds as 0m", () => {
    expect(formatDuration(59)).toBe("0m");
  });
});
