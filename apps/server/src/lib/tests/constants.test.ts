import {
  CACHE_NO_CACHE,
  CACHE_NO_STORE,
  CACHE_PRIVATE_NO_CACHE,
  CACHE_PRIVATE_REVALIDATE,
  CACHE_PUBLIC_REVALIDATE,
  FIFTEEN_SECONDS,
  FIVE_MB,
  FIVE_MINUTES,
  ONE_DAY,
  ONE_HOUR,
  ONE_MB,
  ONE_MINUTE,
  ONE_WEEK,
  ONE_YEAR,
  TEN_MB,
  TEN_MINUTES,
  TEN_SECONDS,
  THIRTY_MINUTES,
  THIRTY_SECONDS,
  TWO_MINUTES,
} from "../constants.js";
import { describe, expect, test } from "vitest";

describe("constants", () => {
  describe("time constants (in seconds)", () => {
    test("should have correct time values", () => {
      expect(TEN_SECONDS).toBe(10);
      expect(FIFTEEN_SECONDS).toBe(15);
      expect(THIRTY_SECONDS).toBe(30);
      expect(ONE_MINUTE).toBe(60);
      expect(TWO_MINUTES).toBe(120);
      expect(FIVE_MINUTES).toBe(300);
      expect(TEN_MINUTES).toBe(600);
      expect(THIRTY_MINUTES).toBe(1800);
      expect(ONE_HOUR).toBe(3600);
      expect(ONE_DAY).toBe(86_400);
      expect(ONE_WEEK).toBe(604_800);
      expect(ONE_YEAR).toBe(31_536_000);
    });
  });

  describe("data size constants (in bytes)", () => {
    test("should have correct size values", () => {
      expect(ONE_MB).toBe(1_048_576);
      expect(FIVE_MB).toBe(5_242_880);
      expect(TEN_MB).toBe(10_485_760);
    });
  });

  describe("static cache headers", () => {
    test("CACHE_NO_CACHE should set no-cache", () => {
      expect(CACHE_NO_CACHE).toEqual({
        "Cache-Control": "no-cache",
      });
    });

    test("CACHE_PRIVATE_NO_CACHE should set private, no-cache", () => {
      expect(CACHE_PRIVATE_NO_CACHE).toEqual({
        "Cache-Control": "private, no-cache",
      });
    });

    test("CACHE_NO_STORE should include all no-store directives", () => {
      expect(CACHE_NO_STORE["Cache-Control"]).toContain("no-cache");
      expect(CACHE_NO_STORE["Cache-Control"]).toContain("no-store");
      expect(CACHE_NO_STORE["Cache-Control"]).toContain("private");
      expect(CACHE_NO_STORE["Cache-Control"]).toContain("must-revalidate");
      expect(CACHE_NO_STORE["Cache-Control"]).toContain("max-age=0");
      expect(CACHE_NO_STORE["Pragma"]).toBe("no-cache");
      expect(CACHE_NO_STORE["Expires"]).toBe("0");
    });
  });

  describe("CACHE_PUBLIC_REVALIDATE", () => {
    test("should generate correct Cache-Control and CDN headers", () => {
      const result = CACHE_PUBLIC_REVALIDATE({
        maxAge: 300,
        cdnMaxAge: 600,
      });

      expect(result["Cache-Control"]).toBe(
        `public, max-age=300, stale-if-error=${ONE_HOUR}, must-revalidate`,
      );
      expect(result["Cloudflare-CDN-Cache-Control"]).toBe(
        `public, max-age=600, stale-if-error=${ONE_HOUR}, must-revalidate`,
      );
    });

    test("should use default staleIfError of ONE_HOUR", () => {
      const result = CACHE_PUBLIC_REVALIDATE({
        maxAge: 60,
        cdnMaxAge: 120,
      });

      expect(result["Cache-Control"]).toContain(`stale-if-error=${ONE_HOUR}`);
    });

    test("should allow custom staleIfError", () => {
      const result = CACHE_PUBLIC_REVALIDATE({
        maxAge: 60,
        cdnMaxAge: 120,
        staleIfError: 7200,
      });

      expect(result["Cache-Control"]).toContain("stale-if-error=7200");
      expect(result["Cloudflare-CDN-Cache-Control"]).toContain(
        "stale-if-error=7200",
      );
    });

    test("should handle zero maxAge", () => {
      const result = CACHE_PUBLIC_REVALIDATE({
        maxAge: 0,
        cdnMaxAge: 0,
      });

      expect(result["Cache-Control"]).toContain("max-age=0");
      expect(result["Cloudflare-CDN-Cache-Control"]).toContain("max-age=0");
    });
  });

  describe("CACHE_PRIVATE_REVALIDATE", () => {
    test("should generate correct private Cache-Control header", () => {
      const result = CACHE_PRIVATE_REVALIDATE({ maxAge: 300 });

      expect(result["Cache-Control"]).toBe(
        `private, max-age=300, stale-if-error=${ONE_HOUR}, must-revalidate`,
      );
      expect(result["Vary"]).toBe("Authorization");
    });

    test("should use default staleIfError of ONE_HOUR", () => {
      const result = CACHE_PRIVATE_REVALIDATE({ maxAge: 60 });

      expect(result["Cache-Control"]).toContain(`stale-if-error=${ONE_HOUR}`);
    });

    test("should allow custom staleIfError", () => {
      const result = CACHE_PRIVATE_REVALIDATE({
        maxAge: 60,
        staleIfError: 1800,
      });

      expect(result["Cache-Control"]).toContain("stale-if-error=1800");
    });

    test("should always include Vary: Authorization", () => {
      const result = CACHE_PRIVATE_REVALIDATE({ maxAge: 60 });
      expect(result["Vary"]).toBe("Authorization");
    });

    test("should handle large maxAge values", () => {
      const result = CACHE_PRIVATE_REVALIDATE({ maxAge: ONE_YEAR });

      expect(result["Cache-Control"]).toContain(`max-age=${ONE_YEAR}`);
    });
  });
});
