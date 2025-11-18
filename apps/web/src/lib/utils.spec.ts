import { describe, expect, it } from "vitest";
import { capitalizeFirstLetter, cn, listWithAnd } from "~/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("px-2 py-1", "text-sm");
      expect(result).toBe("px-2 py-1 text-sm");
    });

    it("should handle conditional classes", () => {
      const result = cn("base-class", "conditional-class", "");
      expect(result).toBe("base-class conditional-class");
    });

    it("should merge Tailwind classes and resolve conflicts", () => {
      // tailwind-merge should resolve conflicting classes, keeping the last one
      const result = cn("px-2 px-4", "py-1 py-2");
      expect(result).toBe("px-4 py-2");
    });

    it("should handle empty and undefined values", () => {
      const result = cn("base-class", "", undefined, null, "end-class");
      expect(result).toBe("base-class end-class");
    });

    it("should handle arrays of class names", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("should handle objects with conditional classes", () => {
      const result = cn({
        "always-present": true,
        "conditionally-present": true,
        "never-present": false,
      });
      expect(result).toBe("always-present conditionally-present");
    });

    it("should return empty string when no valid classes are provided", () => {
      const result = cn("", undefined, null, false);
      expect(result).toBe("");
    });
  });

  describe("capitalizeFirstLetter", () => {
    it("should capitalize the first letter of a lowercase string", () => {
      const result = capitalizeFirstLetter("hello");
      expect(result).toBe("Hello");
    });

    it("should keep the first letter capitalized if already uppercase", () => {
      const result = capitalizeFirstLetter("Hello");
      expect(result).toBe("Hello");
    });

    it("should handle single character strings", () => {
      const result = capitalizeFirstLetter("a");
      expect(result).toBe("A");
    });

    it("should handle strings with mixed case", () => {
      const result = capitalizeFirstLetter("hELLO wORLD");
      expect(result).toBe("HELLO wORLD");
    });

    it("should handle empty string", () => {
      const result = capitalizeFirstLetter("");
      expect(result).toBe("");
    });

    it("should handle strings starting with numbers", () => {
      const result = capitalizeFirstLetter("123abc");
      expect(result).toBe("123abc");
    });

    it("should handle strings starting with special characters", () => {
      const result = capitalizeFirstLetter("@hello");
      expect(result).toBe("@hello");
    });

    it("should handle strings with whitespace", () => {
      const result = capitalizeFirstLetter(" hello world");
      expect(result).toBe(" hello world");
    });

    it("should only affect the first character", () => {
      const result = capitalizeFirstLetter("hello world test");
      expect(result).toBe("Hello world test");
    });
  });

  describe("listWithAnd", () => {
    it("should return empty string for empty array", () => {
      const result = listWithAnd([]);
      expect(result).toBe("");
    });

    it("should return single item without modification", () => {
      const result = listWithAnd(["apple"]);
      expect(result).toBe("apple");
    });

    it("should join two items with 'and'", () => {
      const result = listWithAnd(["apple", "banana"]);
      expect(result).toBe("apple and banana");
    });

    it("should join three items with commas and 'and'", () => {
      const result = listWithAnd(["apple", "banana", "orange"]);
      expect(result).toBe("apple, banana, and orange");
    });

    it("should join four items with commas and 'and'", () => {
      const result = listWithAnd(["apple", "banana", "orange", "grape"]);
      expect(result).toBe("apple, banana, orange, and grape");
    });

    it("should handle items with special characters", () => {
      const result = listWithAnd(["C++", "C#", "JavaScript"]);
      expect(result).toBe("C++, C#, and JavaScript");
    });

    it("should handle items with spaces", () => {
      const result = listWithAnd(["red apple", "green banana", "yellow lemon"]);
      expect(result).toBe("red apple, green banana, and yellow lemon");
    });

    it("should handle many items correctly", () => {
      const result = listWithAnd(["one", "two", "three", "four", "five"]);
      expect(result).toBe("one, two, three, four, and five");
    });
  });
});
