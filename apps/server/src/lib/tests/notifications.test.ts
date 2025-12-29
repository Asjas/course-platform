import * as notificationHelpers from "../notifications.js";
import { eq, inArray } from "drizzle-orm";
import { ulid } from "ulid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";
import { userNotification } from "~/db/schema/userNotifications.js";

// Integration tests - no mocking, tests run against real database in CI
describe("Notification Helpers Integration Tests", () => {
  const testUserIds: string[] = [];
  const testNotificationIds: string[] = [];
  let testUserId: string;

  // Create a test user before all tests
  beforeAll(async () => {
    testUserId = ulid();
    await db.insert(user).values({
      id: testUserId,
      email: `test-notifications-${Date.now()}@example.com`,
      emailVerified: false,
      name: "Test User",
      role: "member",
    });
    testUserIds.push(testUserId);
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

  describe.sequential("Payment Notifications", () => {
    it("should create a payment_completed notification", async () => {
      await notificationHelpers.notifyPaymentCompleted({
        userId: testUserId,
        courseName: "Test Course",
        courseSlug: "test-course",
        amount: 1999,
        currency: "USD",
      });

      const notifications = await db
        .select()
        .from(userNotification)
        .where(eq(userNotification.userId, testUserId));

      expect(notifications.length).toBeGreaterThan(0);
      const notification = notifications[0];
      testNotificationIds.push(notification.id);

      expect(notification.type).toBe("payment_completed");
      expect(notification.title).toBe("Payment Successful");
      expect(notification.message).toContain("Test Course");
      expect(notification.message).toContain("USD 19.99");
      expect(notification.link).toBe("/courses/test-course");
    }, 15000); // 15 second timeout for database operations
  });

  describe.sequential("Admin Notifications", () => {
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

      await notificationHelpers.notifyAdminNewReview({
        courseName: "Integration Test Course",
        reviewerName: "Test Reviewer",
        reviewId: "test:review:123",
      });

      // Verify notifications were created for admin users
      const adminIds = admins.map((a) => a.id);
      const notifications = await db
        .select()
        .from(userNotification)
        .where(inArray(userNotification.userId, adminIds));

      // Should have at least one notification per admin
      expect(notifications.length).toBeGreaterThanOrEqual(admins.length);

      // Add notification IDs to cleanup list
      testNotificationIds.push(...notifications.map((n) => n.id));

      const adminNotif = notifications.find(
        (n) => n.type === "admin_new_review",
      );
      expect(adminNotif).toBeDefined();
      expect(adminNotif?.message).toContain("Integration Test Course");
      expect(adminNotif?.message).toContain("Test Reviewer");
    }, 15000); // 15 second timeout for database operations
  });
});
