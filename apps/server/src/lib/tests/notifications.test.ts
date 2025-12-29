import * as notificationHelpers from "../notifications.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as userQueries from "~/db/queries/user.js";
import * as notificationMutations from "~/routers/notifications/mutations.js";

// Mock database
vi.mock("~/db/index.js", () => ({
  db: {},
  pool: {},
}));

// Mock the dependencies
vi.mock("~/routers/notifications/mutations.js");
vi.mock("~/db/queries/user.js");

describe("Notification Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Payment Notifications", () => {
    it("should create a payment_completed notification with correct data", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:123",
        type: "payment_completed",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyPaymentCompleted({
        userId: "user:123",
        courseName: "Test Course",
        courseSlug: "test-course",
        amount: 1999,
        currency: "USD",
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.userId).toBe("user:123");
      expect(callArg.newNotification.type).toBe("payment_completed");
      expect(callArg.newNotification.title).toBe("Payment Successful");
      expect(callArg.newNotification.message).toContain("Test Course");
      expect(callArg.newNotification.message).toContain("USD 19.99");
      expect(callArg.newNotification.link).toBe("/courses/test-course");
    });

    it("should create a payment_refunded notification", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:124",
        type: "payment_refunded",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyPaymentRefunded({
        userId: "user:123",
        courseName: "Test Course",
        amount: 1999,
        currency: "USD",
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.type).toBe("payment_refunded");
      expect(callArg.newNotification.title).toBe("Payment Refunded");
    });

    it("should create a payment_failed notification", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:125",
        type: "payment_failed",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyPaymentFailed({
        userId: "user:123",
        courseName: "Test Course",
        courseSlug: "test-course",
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.type).toBe("payment_failed");
      expect(callArg.newNotification.title).toBe("Payment Failed");
    });
  });

  describe("Coupon Notifications", () => {
    it("should create a coupon_redeemed notification", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:126",
        type: "coupon_redeemed",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyCouponRedeemed({
        userId: "user:123",
        couponCode: "SAVE20",
        discountAmount: 2000,
        courseName: "Test Course",
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.type).toBe("coupon_redeemed");
      expect(callArg.newNotification.message).toContain("SAVE20");
      expect(callArg.newNotification.message).toContain("$20.00");
    });

    it("should create a coupon_expired notification", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:127",
        type: "coupon_expired",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyCouponExpired({
        userId: "user:123",
        couponCode: "EXPIRED20",
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.type).toBe("coupon_expired");
      expect(callArg.newNotification.message).toContain("EXPIRED20");
    });
  });

  describe("Team License Notifications", () => {
    it("should create a team_license_purchased notification", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:128",
        type: "team_license_purchased",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyTeamLicensePurchased({
        userId: "user:123",
        courseName: "Test Course",
        courseSlug: "test-course",
        totalSeats: 10,
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.type).toBe("team_license_purchased");
      expect(callArg.newNotification.message).toContain("10 seats");
    });

    it("should create a team_license_invite_received notification", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:129",
        type: "team_license_invite_received",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyTeamLicenseInviteReceived({
        userId: "user:123",
        courseName: "Test Course",
        inviterName: "John Doe",
        inviteCode: "INV123",
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.type).toBe("team_license_invite_received");
      expect(callArg.newNotification.message).toContain("John Doe");
      expect(callArg.newNotification.link).toBe("/team-license/accept/INV123");
    });
  });

  describe("Course Notifications", () => {
    it("should create a course_published notification", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:130",
        type: "course_published",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyCoursePublished({
        userId: "user:123",
        courseName: "New Course",
        courseSlug: "new-course",
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.type).toBe("course_published");
      expect(callArg.newNotification.message).toContain("New Course");
    });

    it("should create a certificate_issued notification", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:131",
        type: "certificate_issued",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyCertificateIssued({
        userId: "user:123",
        courseName: "Completed Course",
        certificateUrl: "/certificates/123",
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.type).toBe("certificate_issued");
      expect(callArg.newNotification.title).toBe("Certificate Issued");
      expect(callArg.newNotification.link).toBe("/certificates/123");
    });
  });

  describe("Support Ticket Notifications", () => {
    it("should create a support_ticket_assigned notification", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:132",
        type: "support_ticket_assigned",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifySupportTicketAssigned({
        userId: "user:123",
        ticketId: "ticket:456",
        ticketTitle: "Help with course",
        assignedByName: "Admin User",
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.type).toBe("support_ticket_assigned");
      expect(callArg.newNotification.supportTicketId).toBe("ticket:456");
    });

    it("should create a support_ticket_resolved notification", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:133",
        type: "support_ticket_resolved",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifySupportTicketResolved({
        userId: "user:123",
        ticketId: "ticket:456",
        ticketTitle: "Help with course",
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.type).toBe("support_ticket_resolved");
    });
  });

  describe("Admin Notifications", () => {
    beforeEach(() => {
      // Mock admin user IDs
      vi.mocked(userQueries.getAdminUserIds).mockResolvedValue([
        "admin:1",
        "admin:2",
      ]);
    });

    it("should create admin_new_review notifications for all admins", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:134",
        type: "admin_new_review",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyAdminNewReview({
        courseName: "Test Course",
        reviewerName: "Jane Doe",
        reviewId: "review:123",
      });

      expect(mockInsert).toHaveBeenCalledTimes(2);
      const firstCall = mockInsert.mock.calls[0][0];
      expect(firstCall.newNotification.type).toBe("admin_new_review");
      expect(firstCall.newNotification.userId).toBe("admin:1");

      const secondCall = mockInsert.mock.calls[1][0];
      expect(secondCall.newNotification.userId).toBe("admin:2");
    });

    it("should create admin_new_support_ticket notifications for all admins", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:135",
        type: "admin_new_support_ticket",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyAdminNewSupportTicket({
        ticketId: "ticket:123",
        ticketTitle: "Need help",
        submittedByName: "User Name",
      });

      expect(mockInsert).toHaveBeenCalledTimes(2);
    });

    it("should create admin_new_purchase notifications for all admins", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:136",
        type: "admin_new_purchase",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyAdminNewPurchase({
        courseName: "Test Course",
        buyerName: "John Smith",
        amount: 4999,
        currency: "USD",
      });

      expect(mockInsert).toHaveBeenCalledTimes(2);
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.message).toContain("USD 49.99");
    });

    it("should create admin_course_review_milestone notifications", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:137",
        type: "admin_course_review_milestone",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyAdminCourseReviewMilestone({
        courseName: "Popular Course",
        courseSlug: "popular-course",
        reviewCount: 100,
      });

      expect(mockInsert).toHaveBeenCalledTimes(2);
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.message).toContain("100 reviews");
    });

    it("should create admin_new_user_registration notifications", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:138",
        type: "admin_new_user_registration",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyAdminNewUserRegistration({
        userName: "New User",
        userEmail: "new@example.com",
      });

      expect(mockInsert).toHaveBeenCalledTimes(2);
      const callArg = mockInsert.mock.calls[0][0];
      expect(callArg.newNotification.message).toContain("New User");
      expect(callArg.newNotification.message).toContain("new@example.com");
    });
  });

  describe("Notification ID Generation", () => {
    it("should generate unique notification IDs", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        id: "notif:generated",
        type: "payment_completed",
      });
      vi.mocked(
        notificationMutations.insertUserNotification,
      ).mockImplementation(mockInsert);

      await notificationHelpers.notifyPaymentCompleted({
        userId: "user:123",
        courseName: "Test Course",
        courseSlug: "test-course",
        amount: 1999,
        currency: "USD",
      });

      const callArg = mockInsert.mock.calls[0][0];
      // Check that the ID is a valid ULID format (26 characters)
      expect(callArg.newNotification.id).toMatch(/^[0-9A-Z]{26}$/i);
    });
  });
});
