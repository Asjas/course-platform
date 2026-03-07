import { getLastSyncTimestamp, setLastSyncTimestamp } from "../utils";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe("getLastSyncTimestamp", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("returns 0 when no timestamp stored", () => {
    expect(getLastSyncTimestamp("courses")).toBe(0);
  });

  test("returns stored timestamp", () => {
    localStorage.setItem("sync:lastTimestamp:courses", "1700000000000");
    expect(getLastSyncTimestamp("courses")).toBe(1700000000000);
  });

  test("returns 0 for non-numeric stored value", () => {
    localStorage.setItem("sync:lastTimestamp:courses", "invalid");
    expect(getLastSyncTimestamp("courses")).toBe(NaN);
  });

  test("uses correct key prefix", () => {
    localStorage.setItem("sync:lastTimestamp:announcements", "12345");
    expect(getLastSyncTimestamp("announcements")).toBe(12345);
    expect(getLastSyncTimestamp("other")).toBe(0);
  });
});

describe("setLastSyncTimestamp", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("stores timestamp correctly", () => {
    setLastSyncTimestamp("courses", 1700000000000);
    expect(localStorage.getItem("sync:lastTimestamp:courses")).toBe(
      "1700000000000",
    );
  });

  test("overwrites existing timestamp", () => {
    setLastSyncTimestamp("courses", 1000);
    setLastSyncTimestamp("courses", 2000);
    expect(localStorage.getItem("sync:lastTimestamp:courses")).toBe("2000");
  });

  test("stores for different collections independently", () => {
    setLastSyncTimestamp("courses", 1000);
    setLastSyncTimestamp("announcements", 2000);
    expect(localStorage.getItem("sync:lastTimestamp:courses")).toBe("1000");
    expect(localStorage.getItem("sync:lastTimestamp:announcements")).toBe(
      "2000",
    );
  });
});
