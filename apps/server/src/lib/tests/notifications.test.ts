import {
  notifyAdminChatMessageReported,
  notifyAdminCouponUsageThreshold,
  notifyAdminCourseReviewMilestone,
  notifyAdminEnrollmentMilestone,
  notifyAdminNewPurchase,
  notifyAdminNewReview,
  notifyAdminNewSupportTicket,
  notifyAdminNewUserRegistration,
  notifyAdminRefundRequested,
  notifyAdminSupportTicketComment,
  notifyAdminTeamLicenseCreated,
  notifyCertificateIssued,
  notifyCouponExpired,
  notifyCouponRedeemed,
  notifyCoursePublished,
  notifyPaymentCompleted,
  notifyPaymentFailed,
  notifyPaymentRefunded,
  notifySupportTicketAssigned,
  notifySupportTicketResolved,
  notifyTeamLicenseInviteAccepted,
  notifyTeamLicenseInviteReceived,
  notifyTeamLicenseInviteRevoked,
  notifyTeamLicensePurchased,
  notifyTeamLicenseSeatClaimed,
} from "../notifications.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getAdminUserIds } from "~/db/queries/user.js";
import { insertUserNotification } from "~/routers/notifications/mutations.js";

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: () => ({
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

vi.mock("~/lib/mailer.js", () => ({
  default: {
    sendMail: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("~/routers/notificationPreferences/queries.js", () => ({
  isNotificationPreferenceEnabled: vi.fn().mockResolvedValue(false),
}));

vi.mock("ulid", () => ({
  ulid: () => "mock-ulid-id",
}));

vi.mock("~/routers/notifications/mutations.js", () => ({
  insertUserNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("~/db/queries/user.js", () => ({
  getAdminUserIds: vi.fn().mockResolvedValue(["admin-1", "admin-2"]),
  getUserById: vi.fn().mockResolvedValue(null),
}));

const mockInsert = vi.mocked(insertUserNotification);
const mockGetAdminIds = vi.mocked(getAdminUserIds);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("user notification functions", () => {
  test("notifyPaymentCompleted sends correct notification", async () => {
    await notifyPaymentCompleted({
      userId: "user-1",
      courseName: "Learn Fastify",
      courseSlug: "learn-fastify",
      amount: 4999,
      currency: "USD",
    });

    expect(mockInsert).toHaveBeenCalledOnce();
    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "payment_completed",
      title: "Payment Successful",
      link: "/courses/learn-fastify",
    });
    expect(call.newNotification.message).toContain("USD 49.99");
  });

  test("notifyPaymentRefunded sends correct notification", async () => {
    await notifyPaymentRefunded({
      userId: "user-1",
      courseName: "Learn Fastify",
      amount: 4999,
      currency: "USD",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "payment_refunded",
      title: "Payment Refunded",
      link: null,
    });
    expect(call.newNotification.message).toContain("USD 49.99");
  });

  test("notifyPaymentFailed sends correct notification", async () => {
    await notifyPaymentFailed({
      userId: "user-1",
      courseName: "Learn Fastify",
      courseSlug: "learn-fastify",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "payment_failed",
      title: "Payment Failed",
      link: "/courses/learn-fastify",
    });
  });

  test("notifyCouponRedeemed sends correct notification", async () => {
    await notifyCouponRedeemed({
      userId: "user-1",
      couponCode: "SAVE20",
      discountAmount: 2000,
      courseName: "Learn Fastify",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "coupon_redeemed",
      title: "Coupon Applied",
    });
    expect(call.newNotification.message).toContain("SAVE20");
    expect(call.newNotification.message).toContain("$20.00");
  });

  test("notifyCouponExpired sends correct notification", async () => {
    await notifyCouponExpired({
      userId: "user-1",
      couponCode: "EXPIRED10",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "coupon_expired",
      title: "Coupon Expired",
    });
    expect(call.newNotification.message).toContain("EXPIRED10");
  });

  test("notifyTeamLicensePurchased sends correct notification", async () => {
    await notifyTeamLicensePurchased({
      userId: "user-1",
      courseName: "Learn Fastify",
      courseSlug: "learn-fastify",
      totalSeats: 10,
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "team_license_purchased",
      link: "/courses/learn-fastify",
    });
    expect(call.newNotification.message).toContain("10 seats");
  });

  test("notifyTeamLicenseInviteReceived sends correct notification", async () => {
    await notifyTeamLicenseInviteReceived({
      userId: "user-2",
      courseName: "Learn Fastify",
      inviterName: "Alice",
      inviteCode: "inv-123",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-2",
      type: "team_license_invite_received",
      link: "/team-license/accept/inv-123",
    });
    expect(call.newNotification.message).toContain("Alice");
  });

  test("notifyTeamLicenseInviteAccepted sends correct notification", async () => {
    await notifyTeamLicenseInviteAccepted({
      purchaserId: "user-1",
      courseName: "Learn Fastify",
      acceptedByName: "Bob",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "team_license_invite_accepted",
    });
    expect(call.newNotification.message).toContain("Bob");
  });

  test("notifyTeamLicenseInviteRevoked sends correct notification", async () => {
    await notifyTeamLicenseInviteRevoked({
      userId: "user-2",
      courseName: "Learn Fastify",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-2",
      type: "team_license_invite_revoked",
    });
  });

  test("notifyTeamLicenseSeatClaimed sends correct notification", async () => {
    await notifyTeamLicenseSeatClaimed({
      purchaserId: "user-1",
      courseName: "Learn Fastify",
      claimerName: "Charlie",
      claimedSeats: 3,
      totalSeats: 10,
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "team_license_seat_claimed",
    });
    expect(call.newNotification.message).toContain("3/10");
    expect(call.newNotification.message).toContain("Charlie");
  });

  test("notifyCoursePublished sends correct notification", async () => {
    await notifyCoursePublished({
      userId: "user-1",
      courseName: "Learn Fastify",
      courseSlug: "learn-fastify",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "course_published",
      link: "/courses/learn-fastify",
    });
  });

  test("notifyCertificateIssued sends correct notification", async () => {
    await notifyCertificateIssued({
      userId: "user-1",
      courseName: "Learn Fastify",
      certificateUrl: "/certificates/cert-123",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "certificate_issued",
      link: "/certificates/cert-123",
    });
  });

  test("notifySupportTicketAssigned includes supportTicketId", async () => {
    await notifySupportTicketAssigned({
      userId: "user-1",
      ticketId: "ticket-1",
      ticketTitle: "Help needed",
      assignedByName: "Admin",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "support_ticket_assigned",
      supportTicketId: "ticket-1",
      link: "/admin/support-tickets/ticket-1",
    });
  });

  test("notifySupportTicketResolved includes supportTicketId", async () => {
    await notifySupportTicketResolved({
      userId: "user-1",
      ticketId: "ticket-1",
      ticketTitle: "Help needed",
    });

    const call = mockInsert.mock.calls[0][0];
    expect(call.newNotification).toMatchObject({
      userId: "user-1",
      type: "support_ticket_resolved",
      supportTicketId: "ticket-1",
      link: "/support-tickets/ticket-1",
    });
  });
});

describe("admin notification functions", () => {
  test("notifyAdminNewReview notifies all admins", async () => {
    await notifyAdminNewReview({
      courseName: "Learn Fastify",
      reviewerName: "Bob",
      reviewId: "review-1",
    });

    expect(mockGetAdminIds).toHaveBeenCalledOnce();
    expect(mockInsert).toHaveBeenCalledTimes(2); // 2 admin users
    expect(mockInsert.mock.calls[0][0].newNotification.userId).toBe("admin-1");
    expect(mockInsert.mock.calls[1][0].newNotification.userId).toBe("admin-2");
    expect(mockInsert.mock.calls[0][0].newNotification).toMatchObject({
      type: "admin_new_review",
      link: "/admin/reviews/review-1",
    });
  });

  test("notifyAdminNewSupportTicket notifies all admins with supportTicketId", async () => {
    await notifyAdminNewSupportTicket({
      ticketId: "ticket-1",
      ticketTitle: "Bug report",
      submittedByName: "Alice",
    });

    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockInsert.mock.calls[0][0].newNotification).toMatchObject({
      type: "admin_new_support_ticket",
      supportTicketId: "ticket-1",
    });
  });

  test("notifyAdminSupportTicketComment notifies all admins", async () => {
    await notifyAdminSupportTicketComment({
      ticketId: "ticket-1",
      ticketTitle: "Bug report",
      commenterName: "Alice",
    });

    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockInsert.mock.calls[0][0].newNotification.type).toBe(
      "admin_support_ticket_comment",
    );
  });

  test("notifyAdminNewPurchase formats amount correctly", async () => {
    await notifyAdminNewPurchase({
      courseName: "Learn Fastify",
      buyerName: "Bob",
      amount: 4999,
      currency: "USD",
    });

    expect(mockInsert.mock.calls[0][0].newNotification.message).toContain(
      "USD 49.99",
    );
  });

  test("notifyAdminRefundRequested formats amount correctly", async () => {
    await notifyAdminRefundRequested({
      courseName: "Learn Fastify",
      requesterName: "Bob",
      amount: 4999,
      currency: "USD",
    });

    expect(mockInsert.mock.calls[0][0].newNotification.message).toContain(
      "USD 49.99",
    );
  });

  test("notifyAdminCouponUsageThreshold includes counts", async () => {
    await notifyAdminCouponUsageThreshold({
      couponCode: "SAVE20",
      redemptionCount: 8,
      redemptionLimit: 10,
    });

    expect(mockInsert.mock.calls[0][0].newNotification.message).toContain(
      "8/10",
    );
  });

  test("notifyAdminTeamLicenseCreated includes seat count", async () => {
    await notifyAdminTeamLicenseCreated({
      courseName: "Learn Fastify",
      purchaserName: "Bob",
      totalSeats: 5,
    });

    expect(mockInsert.mock.calls[0][0].newNotification.message).toContain(
      "5 seats",
    );
  });

  test("notifyAdminCourseReviewMilestone includes review count", async () => {
    await notifyAdminCourseReviewMilestone({
      courseName: "Learn Fastify",
      courseSlug: "learn-fastify",
      reviewCount: 100,
    });

    expect(mockInsert.mock.calls[0][0].newNotification.message).toContain(
      "100 reviews",
    );
  });

  test("notifyAdminEnrollmentMilestone includes enrollment count", async () => {
    await notifyAdminEnrollmentMilestone({
      courseName: "Learn Fastify",
      courseSlug: "learn-fastify",
      enrollmentCount: 500,
    });

    expect(mockInsert.mock.calls[0][0].newNotification.message).toContain(
      "500 enrollments",
    );
  });

  test("notifyAdminNewUserRegistration includes user info", async () => {
    await notifyAdminNewUserRegistration({
      userName: "Alice",
      userEmail: "alice@example.com",
    });

    const msg = mockInsert.mock.calls[0][0].newNotification.message;
    expect(msg).toContain("Alice");
    expect(msg).toContain("alice@example.com");
  });

  test("notifyAdminChatMessageReported includes report details", async () => {
    await notifyAdminChatMessageReported({
      reportId: "report-1",
      channelId: "general",
      reporterName: "Bob",
      reason: "spam",
    });

    const notif = mockInsert.mock.calls[0][0].newNotification;
    expect(notif.message).toContain("general");
    expect(notif.message).toContain("spam");
    expect(notif).toMatchObject({
      chatMessageReportId: "report-1",
    });
  });
});
