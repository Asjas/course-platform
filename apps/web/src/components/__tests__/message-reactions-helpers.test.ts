import type { Reaction } from "@apps/server/src/routers/chat";
import { describe, expect, test } from "vitest";
import {
  getReactionTooltip,
  hasUserReacted,
} from "~/components/message-reactions";

function makeReaction(
  emoji: string,
  users: { userId: string; userName: string }[],
): Reaction {
  return { emoji, users };
}

describe("hasUserReacted", () => {
  const reaction = makeReaction("👍", [
    { userId: "user-1", userName: "Alice" },
    { userId: "user-2", userName: "Bob" },
  ]);

  test("returns true when user is in the reaction list", () => {
    expect(hasUserReacted(reaction, "user-1")).toBe(true);
  });

  test("returns false when user is not in the reaction list", () => {
    expect(hasUserReacted(reaction, "user-3")).toBe(false);
  });

  test("returns false when currentUserId is undefined", () => {
    expect(hasUserReacted(reaction, undefined)).toBe(false);
  });

  test("returns false for empty users list", () => {
    const empty = makeReaction("🎉", []);
    expect(hasUserReacted(empty, "user-1")).toBe(false);
  });
});

describe("getReactionTooltip", () => {
  test("returns empty string for no users", () => {
    expect(getReactionTooltip(makeReaction("👍", []))).toBe("");
  });

  test("returns single user name", () => {
    const reaction = makeReaction("👍", [{ userId: "1", userName: "Alice" }]);
    expect(getReactionTooltip(reaction)).toBe("Alice");
  });

  test("returns two names joined with 'and'", () => {
    const reaction = makeReaction("👍", [
      { userId: "1", userName: "Alice" },
      { userId: "2", userName: "Bob" },
    ]);
    expect(getReactionTooltip(reaction)).toBe("Alice and Bob");
  });

  test("returns three names with Oxford comma", () => {
    const reaction = makeReaction("👍", [
      { userId: "1", userName: "Alice" },
      { userId: "2", userName: "Bob" },
      { userId: "3", userName: "Charlie" },
    ]);
    expect(getReactionTooltip(reaction)).toBe("Alice, Bob, and Charlie");
  });

  test("returns first two names and count for 4+ users", () => {
    const reaction = makeReaction("👍", [
      { userId: "1", userName: "Alice" },
      { userId: "2", userName: "Bob" },
      { userId: "3", userName: "Charlie" },
      { userId: "4", userName: "Diana" },
    ]);
    expect(getReactionTooltip(reaction)).toBe("Alice, Bob, and 2 others");
  });

  test("handles 5 users correctly", () => {
    const reaction = makeReaction("🎉", [
      { userId: "1", userName: "A" },
      { userId: "2", userName: "B" },
      { userId: "3", userName: "C" },
      { userId: "4", userName: "D" },
      { userId: "5", userName: "E" },
    ]);
    expect(getReactionTooltip(reaction)).toBe("A, B, and 3 others");
  });
});
