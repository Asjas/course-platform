import * as notificationHelpers from "../notifications.js";
import { eq, inArray } from "drizzle-orm";
import { ulid } from "ulid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";
import { userNotification } from "~/db/schema/userNotifications.js";

// Integration tests - no mocking, tests run against real database in CI
// Use sequential to prevent database deadlocks from concurrent test execution
describe.sequential("Notification Helpers Integration Tests", () => {
  const testUserIds: string[] = [];
  const testNotificationIds: string[] = [];
  let testUserId: string;

  // Create a test user before all tests
  beforeAll(async () => {
    const userId = ulid();
    const [createdUser] = await db
      .insert(user)
      .values({
        id: userId,
        email: `test-notifications-${Date.now()}@example.com`,
        emailVerified: false,
        name: "Test User",
        role: "member",
      })
      .returning();

    // Single validation point - capture and verify in one step
    if (!createdUser?.id) {
      throw new Error("Failed to create test user");
    }
    
    testUserId = createdUser.id;
    testUserIds.push(createdUser.id);
  });

  // Clean up all test data after all tests
  afterAll(async () => {
    if (testNotificationIds.length > 0) {
      await db
        .delete(userNotification)
        .where(inArray(userNotification.id, testNotificationIds));
    }
    if (testUserIds.length > 0) {
      await db.delete(user).where(inArray(user.id, testUserIds));
    }
  });

  describe("Payment Notifications", () => {
    it("should create a payment_completed notification", async () => {
      const result = await notificationHelpers.notifyPaymentCompleted({
        userId: testUserId,
        courseName: "Test Course",
        courseSlug: "test-course",
        amount: 1999,
        currency: "USD",
      });

      // Single validation point - use the returned result
      if (!result?.id) {
        throw new Error("Failed to create notification");
      }
      testNotificationIds.push(result.id);

      expect(result.type).toBe("payment_completed");
      expect(result.title).toBe("Payment Successful");
      expect(result.message).toContain("Test Course");
      expect(result.message).toContain("USD 19.99");
      expect(result.link).toBe("/courses/test-course");
    }, 15000); // 15 second timeout for database operations
  });

  describe("Admin Notifications", () => {
    it("should create notifications for all admin users", async () => {
      // Get actual admin user IDs from database
      const admins = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.role, "admin"))
        .limit(5);

      if (admins.length === 0) {
        console.warn(
          "No admin users found in database, skipping admin notification test",
        );
        return;
      }

      const results = await notificationHelpers.notifyAdminNewReview({
        courseName: "Integration Test Course",
        reviewerName: "Test Reviewer",
        reviewId: "test:review:123",
      });

      // Single validation point - use the returned results directly
      if (!results || !Array.isArray(results) || results.length === 0) {
        throw new Error("Failed to create admin notifications");
      }

      expect(results.length).toBeGreaterThanOrEqual(admins.length);
      
      // Add notification IDs to cleanup list
      testNotificationIds.push(...results.map((r) => r.id));

      // Verify content from returned results (no duplicate query)
      const adminNotif = results.find((n) => n.type === "admin_new_review");
      expect(adminNotif).toBeDefined();
      expect(adminNotif?.message).toContain("Integration Test Course");
      expect(adminNotif?.message).toContain("Test Reviewer");
    }, 15000); // 15 second timeout for database operations
  });
});
