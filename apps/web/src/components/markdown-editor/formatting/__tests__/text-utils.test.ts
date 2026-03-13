import {
  findMarkersAroundCursor,
  findSingleCharMarker,
  getPreviousLine,
  isAtStartOfLine,
} from "../text-utils";
import { describe, expect, it } from "vitest";

describe("isAtStartOfLine", () => {
  it("returns true when position is 0", () => {
    expect(isAtStartOfLine("hello", 0)).toBe(true);
  });

  it("returns true when previous character is a newline", () => {
    expect(isAtStartOfLine("first\nsecond", 6)).toBe(true);
  });

  it("returns false when cursor is mid-line", () => {
    expect(isAtStartOfLine("hello world", 5)).toBe(false);
  });

  it("returns false when cursor is at end of a line without preceding newline", () => {
    expect(isAtStartOfLine("hello", 5)).toBe(false);
  });
});

describe("getPreviousLine", () => {
  it("returns null when position is 0", () => {
    expect(getPreviousLine("hello", 0)).toBeNull();
  });

  it("returns null when everything before cursor is whitespace", () => {
    expect(getPreviousLine("   \nhello", 4)).toBeNull();
  });

  it("returns the content before the cursor on the current line", () => {
    expect(getPreviousLine("first\nsecond", 12)).toBe("second");
  });

  it("returns content of the line up to cursor position", () => {
    expect(getPreviousLine("hello world", 5)).toBe("hello");
  });

  it("returns the previous line when cursor is at start of a new line", () => {
    expect(getPreviousLine("abc\n", 4)).toBeNull();
  });
});

describe("findMarkersAroundCursor", () => {
  it("finds bold markers around cursor", () => {
    const text = "**bold text**";
    const result = findMarkersAroundCursor(text, 2, 11, "**", "**");
    expect(result.found).toBe(true);
    expect(result.markerStart).toBe(0);
    expect(result.markerEnd).toBe(13);
    expect(result.innerText).toBe("bold text");
  });

  it("returns not found when no markers exist", () => {
    const text = "plain text";
    const result = findMarkersAroundCursor(text, 2, 7, "**", "**");
    expect(result.found).toBe(false);
  });

  it("returns not found when only opening marker exists", () => {
    const text = "**bold text";
    const result = findMarkersAroundCursor(text, 2, 6, "**", "**");
    expect(result.found).toBe(false);
  });

  it("returns not found when only closing marker exists", () => {
    const text = "bold text**";
    const result = findMarkersAroundCursor(text, 0, 4, "**", "**");
    expect(result.found).toBe(false);
  });

  it("finds markers when cursor is at the start of inner text", () => {
    const text = "hello **world** end";
    const result = findMarkersAroundCursor(text, 8, 13, "**", "**");
    expect(result.found).toBe(true);
    expect(result.innerText).toBe("world");
  });
});

describe("findSingleCharMarker", () => {
  it("finds italic markers around cursor", () => {
    const text = "_italic_";
    const result = findSingleCharMarker(text, 1, 7, "_");
    expect(result.found).toBe(true);
    expect(result.markerStart).toBe(0);
    expect(result.markerEnd).toBe(8);
    expect(result.innerText).toBe("italic");
  });

  it("returns not found when no markers exist", () => {
    const text = "plain text";
    const result = findSingleCharMarker(text, 2, 7, "_");
    expect(result.found).toBe(false);
  });

  it("does not match double markers (e.g., __bold__)", () => {
    const text = "__bold__";
    const result = findSingleCharMarker(text, 2, 6, "_");
    expect(result.found).toBe(false);
  });

  it("finds single marker in a mixed text", () => {
    const text = "hello _world_ end";
    const result = findSingleCharMarker(text, 7, 12, "_");
    expect(result.found).toBe(true);
    expect(result.innerText).toBe("world");
  });

  it("returns not found when cursor is outside markers", () => {
    const text = "hello _world_ end";
    const result = findSingleCharMarker(text, 0, 5, "_");
    expect(result.found).toBe(false);
  });
});
