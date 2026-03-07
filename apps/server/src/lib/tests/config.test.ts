import { describe, expect, test } from "vitest";
import { schema } from "~/config.js";

// Test the config schema validation without actually parsing process.env
// We use safeParse to test validation rules without requiring real env vars

// Helper to create a config without a specific key
function omit<T extends Record<string, unknown>>(
  obj: T,
  key: string,
): Omit<T, typeof key> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => k !== key),
  ) as Omit<T, typeof key>;
}

// Helper to create a full valid config object
function validConfig() {
  return {
    PORT: "5000",
    HOST: "localhost",
    NODE_ENV: "development",
    LOG_LEVEL: "info",
    ORIGIN: "http://localhost:4173",
    COOKIE_SECRET: "a".repeat(32),
    COOKIE_DOMAIN: "localhost",
    MAX_HEAP_USED_BYTES: "0",
    MAX_RSS_BYTES: "0",
    BETTER_AUTH_SECRET: "b".repeat(32),
    PEPPER_SECRET: "c".repeat(32),
    SMTP_HOST: "smtp.example.com",
    SMTP_PORT: "587",
    SMTP_USER: "user@example.com",
    SMTP_PASS: "password123",
    SMTP_SECURE: "false",
    DATABASE_URL: "postgres://user:pass@localhost:5432/db",
    REDIS_HOST: "localhost",
    REDIS_PORT: "6379",
    POLAR_ACCESS_TOKEN: "token123",
    POLAR_SUCCESS_URL: "http://localhost:4173/success",
    LEARN_FASTIFY_POLAR_PRODUCT_ID: "550e8400-e29b-41d4-a716-446655440000",
    PROMETHEUS_HOST: "localhost",
    PROMETHEUS_PORT: "9092",
    R2_ACCESS_KEY_ID: "r2key",
    R2_SECRET_ACCESS_KEY: "r2secret",
    R2_BUCKET_NAME: "mybucket",
    R2_ENDPOINT: "https://r2.example.com",
    R2_PUBLIC_URL: "https://cdn.example.com",
    SUPPORT_ASSIGNED_TO_USER_ID: "user-id-123",
  };
}

describe("config schema", () => {
  test("accepts a fully valid config", () => {
    const result = schema.safeParse(validConfig());
    expect(result.success).toBe(true);
  });

  describe("PORT", () => {
    test("rejects non-numeric port", () => {
      const result = schema.safeParse({ ...validConfig(), PORT: "abc" });
      expect(result.success).toBe(false);
    });

    test("rejects negative port", () => {
      const result = schema.safeParse({ ...validConfig(), PORT: "-1" });
      expect(result.success).toBe(false);
    });

    test("transforms string to number", () => {
      const result = schema.safeParse(validConfig());
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(5000);
      }
    });
  });

  describe("NODE_ENV", () => {
    test.each(["development", "production", "test"])("accepts '%s'", (env) => {
      const result = schema.safeParse({ ...validConfig(), NODE_ENV: env });
      expect(result.success).toBe(true);
    });

    test("rejects invalid environment", () => {
      const result = schema.safeParse({
        ...validConfig(),
        NODE_ENV: "staging",
      });
      expect(result.success).toBe(false);
    });

    test("defaults to development when omitted", () => {
      const result = schema.safeParse(omit(validConfig(), "NODE_ENV"));
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe("development");
      }
    });
  });

  describe("ORIGIN", () => {
    test("transforms single URL to array", () => {
      const result = schema.safeParse(validConfig());
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ORIGIN).toEqual(["http://localhost:4173"]);
      }
    });

    test("transforms comma-separated URLs to array", () => {
      const result = schema.safeParse({
        ...validConfig(),
        ORIGIN: "http://localhost:4173, https://example.com",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ORIGIN).toEqual([
          "http://localhost:4173",
          "https://example.com",
        ]);
      }
    });

    test("rejects invalid URLs in ORIGIN", () => {
      const result = schema.safeParse({
        ...validConfig(),
        ORIGIN: "not-a-url",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("COOKIE_SECRET", () => {
    test("rejects secrets shorter than 32 characters", () => {
      const result = schema.safeParse({
        ...validConfig(),
        COOKIE_SECRET: "short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("SMTP_SECURE", () => {
    test("transforms 'true' to boolean true", () => {
      const result = schema.safeParse({
        ...validConfig(),
        SMTP_SECURE: "true",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.SMTP_SECURE).toBe(true);
      }
    });

    test("transforms '1' to boolean true", () => {
      const result = schema.safeParse({
        ...validConfig(),
        SMTP_SECURE: "1",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.SMTP_SECURE).toBe(true);
      }
    });

    test("transforms 'false' to boolean false", () => {
      const result = schema.safeParse({
        ...validConfig(),
        SMTP_SECURE: "false",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.SMTP_SECURE).toBe(false);
      }
    });
  });

  describe("DATABASE_URL", () => {
    test("rejects non-postgres URLs", () => {
      const result = schema.safeParse({
        ...validConfig(),
        DATABASE_URL: "mysql://localhost:3306/db",
      });
      expect(result.success).toBe(false);
    });

    test("rejects invalid URLs", () => {
      const result = schema.safeParse({
        ...validConfig(),
        DATABASE_URL: "not-a-url",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("LOG_LEVEL", () => {
    test.each(["fatal", "error", "warn", "info", "debug", "trace"])(
      "accepts '%s'",
      (level) => {
        const result = schema.safeParse({ ...validConfig(), LOG_LEVEL: level });
        expect(result.success).toBe(true);
      },
    );

    test("rejects invalid log level", () => {
      const result = schema.safeParse({
        ...validConfig(),
        LOG_LEVEL: "verbose",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("optional fields with defaults", () => {
    test("REDIS_HOST defaults to localhost", () => {
      const result = schema.safeParse(omit(validConfig(), "REDIS_HOST"));
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.REDIS_HOST).toBe("localhost");
      }
    });

    test("REDIS_PORT defaults to 6379", () => {
      const result = schema.safeParse(omit(validConfig(), "REDIS_PORT"));
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.REDIS_PORT).toBe(6379);
      }
    });

    test("SENTRY_DSN is optional", () => {
      const config = validConfig();
      const result = schema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe("required fields", () => {
    test.each([
      "PORT",
      "HOST",
      "ORIGIN",
      "COOKIE_SECRET",
      "COOKIE_DOMAIN",
      "BETTER_AUTH_SECRET",
      "PEPPER_SECRET",
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASS",
      "DATABASE_URL",
      "POLAR_ACCESS_TOKEN",
      "POLAR_SUCCESS_URL",
      "LEARN_FASTIFY_POLAR_PRODUCT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
      "R2_ENDPOINT",
      "R2_PUBLIC_URL",
      "SUPPORT_ASSIGNED_TO_USER_ID",
    ])("rejects missing %s", (field) => {
      const result = schema.safeParse(omit(validConfig(), field));
      expect(result.success).toBe(false);
    });
  });
});
