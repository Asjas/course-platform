import { describe, expect, it } from "vitest";

describe("placeholder test suite 7", () => {
  it("validates regex patterns", () => {
    const pattern = /test/i;
    expect(pattern.test("Test")).toBe(true);
    expect(pattern.test("other")).toBe(false);
  });

  it("validates array some and every", () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers.some((n) => n > 4)).toBe(true);
    expect(numbers.every((n) => n > 0)).toBe(true);
  });

  it("validates template literals", () => {
    const name = "world";
    expect(`hello ${name}`).toBe("hello world");
  });
});
