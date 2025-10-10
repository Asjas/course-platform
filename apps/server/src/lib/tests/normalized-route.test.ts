import { normalizeRoute } from "../normalized-route.js";
import { describe, expect, test } from "vitest";

describe("normalizeRoute", () => {
  describe("known route buckets", () => {
    test("should return 'auth_api' for /api/auth", () => {
      expect(normalizeRoute("/api/auth")).toBe("auth_api");
    });

    test("should return 'coupons_api' for /api/coupons", () => {
      expect(normalizeRoute("/api/coupons")).toBe("coupons_api");
    });

    test("should return 'courses_api' for /api/courses", () => {
      expect(normalizeRoute("/api/courses")).toBe("courses_api");
    });

    test("should return 'orders_api' for /api/orders", () => {
      expect(normalizeRoute("/api/orders")).toBe("orders_api");
    });

    test("should return 'users_api' for /api/users", () => {
      expect(normalizeRoute("/api/users")).toBe("users_api");
    });

    test("should return 'sessions_api' for /api/sessions", () => {
      expect(normalizeRoute("/api/sessions")).toBe("sessions_api");
    });

    test("should return 'support_tickets_api' for /api/support-tickets", () => {
      expect(normalizeRoute("/api/support-tickets")).toBe(
        "support_tickets_api",
      );
    });

    test("should return 'team_licenses_api' for /api/team-licenses", () => {
      expect(normalizeRoute("/api/team-licenses")).toBe("team_licenses_api");
    });

    test("should return 'platform_announcements_api' for /api/platform-announcements", () => {
      expect(normalizeRoute("/api/platform-announcements")).toBe(
        "platform_announcements_api",
      );
    });
  });

  describe("route parameter normalization", () => {
    test("should normalize standard route parameters with colon", () => {
      expect(normalizeRoute("/api/users/:id")).toBe("users_api");
      expect(normalizeRoute("/api/courses/:courseId")).toBe("courses_api");
      expect(normalizeRoute("/api/orders/:orderId")).toBe("orders_api");
    });

    test("should normalize multiple route parameters", () => {
      expect(normalizeRoute("/api/courses/:courseId/lessons/:lessonId")).toBe(
        "courses_api",
      );
    });

    test("should normalize typed route parameters (type:value)", () => {
      expect(
        normalizeRoute("/api/users/uuid:123e4567-e89b-12d3-a456-426614174000"),
      ).toBe("users_api");
      expect(normalizeRoute("/api/courses/slug:fastify-course")).toBe(
        "courses_api",
      );
    });

    test("should normalize mixed parameter types", () => {
      expect(normalizeRoute("/api/courses/:id/lessons/slug:intro")).toBe(
        "courses_api",
      );
    });
  });

  describe("wildcard routes", () => {
    test("should handle routes ending with /*", () => {
      expect(normalizeRoute("/api/users/*")).toBe("users_api");
      expect(normalizeRoute("/api/courses/*")).toBe("courses_api");
    });

    test("should handle routes with /* in the middle", () => {
      expect(normalizeRoute("/api/users/*/profile")).toBe("users_api");
    });
  });

  describe("edge cases", () => {
    test("should return 'unknown_api' for undefined", () => {
      expect(normalizeRoute(undefined)).toBe("unknown_api");
    });

    test("should return 'unknown_api' for empty string", () => {
      expect(normalizeRoute("")).toBe("unknown_api");
    });

    test("should handle unknown routes", () => {
      expect(normalizeRoute("/api/unknown")).toBe("/api/unknown");
      expect(normalizeRoute("/api/v2/users")).toBe("/api/v2/users");
    });

    test("should handle root path", () => {
      expect(normalizeRoute("/")).toBe("/");
    });

    test("should handle routes without /api prefix", () => {
      expect(normalizeRoute("/health")).toBe("/health");
      expect(normalizeRoute("/metrics")).toBe("/metrics");
    });
  });

  describe("complex route patterns", () => {
    test("should normalize nested resource routes", () => {
      expect(
        normalizeRoute(
          "/api/courses/:courseId/modules/:moduleId/lessons/:lessonId",
        ),
      ).toBe("courses_api");
    });

    test("should normalize routes with hyphens and underscores", () => {
      expect(normalizeRoute("/api/support-tickets/:ticketId")).toBe(
        "support_tickets_api",
      );
      expect(normalizeRoute("/api/team-licenses/:licenseId")).toBe(
        "team_licenses_api",
      );
    });

    test("should preserve unmatched routes with parameters", () => {
      expect(normalizeRoute("/api/admin/users/:id")).toBe("/api/admin/users/*");
      expect(normalizeRoute("/api/v2/courses/:slug")).toBe("/api/v2/courses/*");
    });
  });

  describe("cardinality reduction", () => {
    test("should reduce high cardinality routes to buckets", () => {
      // Multiple different IDs should map to same bucket
      expect(normalizeRoute("/api/users/:id1")).toBe("users_api");
      expect(normalizeRoute("/api/users/:id2")).toBe("users_api");
      expect(normalizeRoute("/api/users/:id3")).toBe("users_api");

      // All map to same bucket regardless of parameter name
      expect(normalizeRoute("/api/courses/:courseId")).toBe("courses_api");
      expect(normalizeRoute("/api/courses/:id")).toBe("courses_api");
      expect(normalizeRoute("/api/courses/:slug")).toBe("courses_api");
    });

    test("should handle UUIDs and other identifiers", () => {
      expect(
        normalizeRoute("/api/orders/uuid:550e8400-e29b-41d4-a716-446655440000"),
      ).toBe("orders_api");
      expect(normalizeRoute("/api/sessions/session:abc123xyz")).toBe(
        "sessions_api",
      );
    });
  });

  describe("trailing slashes", () => {
    test("should handle routes with trailing slashes", () => {
      expect(normalizeRoute("/api/users/")).toBe("users_api");
      expect(normalizeRoute("/api/courses/:id/")).toBe("courses_api");
    });
  });
});
