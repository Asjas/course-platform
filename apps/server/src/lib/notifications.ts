import { ulid } from "ulid";
import { getAdminUserIds } from "~/db/queries/user.js";
import type { NewUserNotification } from "~/db/schema/userNotifications.js";
import { insertUserNotification } from "~/routers/notifications/mutations.js";

/**
 * Helper functions to create notifications for various events
 * These can be called from different parts of the application
 */

// ========== Payment Notifications ==========

export async function notifyPaymentCompleted({
  userId,
  courseName,
  courseSlug,
  amount,
  currency,
}: {
  userId: string;
  courseName: string;
  courseSlug: string;
  amount: number;
  currency: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "payment_completed",
      title: "Payment Successful",
      message: `Your payment of ${currency} ${(amount / 100).toFixed(2)} for "${courseName}" has been processed successfully.`,
      link: `/courses/${courseSlug}`,
    },
  });
}

export async function notifyPaymentRefunded({
  userId,
  courseName,
  amount,
  currency,
}: {
  userId: string;
  courseName: string;
  amount: number;
  currency: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "payment_refunded",
      title: "Payment Refunded",
      message: `Your payment of ${currency} ${(amount / 100).toFixed(2)} for "${courseName}" has been refunded.`,
      link: null,
    },
  });
}

export async function notifyPaymentFailed({
  userId,
  courseName,
  courseSlug,
}: {
  userId: string;
  courseName: string;
  courseSlug: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "payment_failed",
      title: "Payment Failed",
      message: `Your payment for "${courseName}" could not be processed. Please try again or use a different payment method.`,
      link: `/courses/${courseSlug}`,
    },
  });
}

// ========== Coupon Notifications ==========

export async function notifyCouponRedeemed({
  userId,
  couponCode,
  discountAmount,
  courseName,
}: {
  userId: string;
  couponCode: string;
  discountAmount: number;
  courseName: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "coupon_redeemed",
      title: "Coupon Applied",
      message: `Coupon "${couponCode}" has been successfully applied! You saved $${(discountAmount / 100).toFixed(2)} on "${courseName}".`,
      link: null,
    },
  });
}

export async function notifyCouponExpired({
  userId,
  couponCode,
}: {
  userId: string;
  couponCode: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "coupon_expired",
      title: "Coupon Expired",
      message: `Your coupon "${couponCode}" has expired and is no longer valid.`,
      link: null,
    },
  });
}

// ========== Team License Notifications ==========

export async function notifyTeamLicensePurchased({
  userId,
  courseName,
  courseSlug,
  totalSeats,
}: {
  userId: string;
  courseName: string;
  courseSlug: string;
  totalSeats: number;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "team_license_purchased",
      title: "Team License Created",
      message: `Your team license for "${courseName}" with ${totalSeats} seats has been created successfully.`,
      link: `/courses/${courseSlug}`,
    },
  });
}

export async function notifyTeamLicenseInviteReceived({
  userId,
  courseName,
  inviterName,
  inviteCode,
}: {
  userId: string;
  courseName: string;
  inviterName: string;
  inviteCode: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "team_license_invite_received",
      title: "Team License Invitation",
      message: `${inviterName} has invited you to join their team license for "${courseName}".`,
      link: `/team-license/accept/${inviteCode}`,
    },
  });
}

export async function notifyTeamLicenseInviteAccepted({
  purchaserId,
  courseName,
  acceptedByName,
}: {
  purchaserId: string;
  courseName: string;
  acceptedByName: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId: purchaserId,
      type: "team_license_invite_accepted",
      title: "Invitation Accepted",
      message: `${acceptedByName} has accepted your team license invitation for "${courseName}".`,
      link: null,
    },
  });
}

export async function notifyTeamLicenseInviteRevoked({
  userId,
  courseName,
}: {
  userId: string;
  courseName: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "team_license_invite_revoked",
      title: "Invitation Revoked",
      message: `Your team license invitation for "${courseName}" has been revoked.`,
      link: null,
    },
  });
}

export async function notifyTeamLicenseSeatClaimed({
  purchaserId,
  courseName,
  claimerName,
  claimedSeats,
  totalSeats,
}: {
  purchaserId: string;
  courseName: string;
  claimerName: string;
  claimedSeats: number;
  totalSeats: number;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId: purchaserId,
      type: "team_license_seat_claimed",
      title: "Team Seat Claimed",
      message: `${claimerName} has claimed a seat on your team license for "${courseName}". ${claimedSeats}/${totalSeats} seats used.`,
      link: null,
    },
  });
}

// ========== Course Notifications ==========

export async function notifyCoursePublished({
  userId,
  courseName,
  courseSlug,
}: {
  userId: string;
  courseName: string;
  courseSlug: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "course_published",
      title: "New Course Available",
      message: `A new course "${courseName}" has been published and is now available!`,
      link: `/courses/${courseSlug}`,
    },
  });
}

export async function notifyCertificateIssued({
  userId,
  courseName,
  certificateUrl,
}: {
  userId: string;
  courseName: string;
  certificateUrl: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "certificate_issued",
      title: "Certificate Issued",
      message: `Congratulations! Your completion certificate for "${courseName}" has been issued.`,
      link: certificateUrl,
    },
  });
}

// ========== Support Ticket Notifications ==========

export async function notifySupportTicketAssigned({
  userId,
  ticketId,
  ticketTitle,
  assignedByName,
}: {
  userId: string;
  ticketId: string;
  ticketTitle: string;
  assignedByName: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "support_ticket_assigned",
      title: "Ticket Assigned to You",
      message: `${assignedByName} has assigned support ticket "${ticketTitle}" to you.`,
      link: `/admin/support-tickets/${ticketId}`,
      supportTicketId: ticketId,
    },
  });
}

export async function notifySupportTicketResolved({
  userId,
  ticketId,
  ticketTitle,
}: {
  userId: string;
  ticketId: string;
  ticketTitle: string;
}) {
  return insertUserNotification({
    newNotification: {
      id: ulid(),
      userId,
      type: "support_ticket_resolved",
      title: "Ticket Resolved",
      message: `Your support ticket "${ticketTitle}" has been marked as resolved.`,
      link: `/support-tickets/${ticketId}`,
      supportTicketId: ticketId,
    },
  });
}

// ========== Admin Notifications ==========

/**
 * Helper to send notification to all admins
 */
async function notifyAllAdmins(
  createNotification: (userId: string) => NewUserNotification,
) {
  const adminUserIds = await getAdminUserIds();
  const notifications = adminUserIds.map((userId) =>
    insertUserNotification({
      newNotification: createNotification(userId),
    }),
  );

  return Promise.all(notifications);
}

export async function notifyAdminNewReview({
  courseName,
  reviewerName,
  reviewId,
}: {
  courseName: string;
  reviewerName: string;
  reviewId: string;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_new_review",
    title: "New Review Submitted",
    message: `${reviewerName} submitted a review for "${courseName}" that needs approval.`,
    link: `/admin/reviews/${reviewId}`,
  }));
}

export async function notifyAdminNewSupportTicket({
  ticketId,
  ticketTitle,
  submittedByName,
}: {
  ticketId: string;
  ticketTitle: string;
  submittedByName: string;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_new_support_ticket",
    title: "New Support Ticket",
    message: `${submittedByName} created a new support ticket: "${ticketTitle}".`,
    link: `/admin/support-tickets/${ticketId}`,
    supportTicketId: ticketId,
  }));
}

export async function notifyAdminSupportTicketComment({
  ticketId,
  ticketTitle,
  commenterName,
}: {
  ticketId: string;
  ticketTitle: string;
  commenterName: string;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_support_ticket_comment",
    title: "New Ticket Comment",
    message: `${commenterName} added a comment to support ticket "${ticketTitle}".`,
    link: `/admin/support-tickets/${ticketId}`,
    supportTicketId: ticketId,
  }));
}

export async function notifyAdminNewPurchase({
  courseName,
  buyerName,
  amount,
  currency,
}: {
  courseName: string;
  buyerName: string;
  amount: number;
  currency: string;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_new_purchase",
    title: "New Purchase",
    message: `${buyerName} purchased "${courseName}" for ${currency} ${(amount / 100).toFixed(2)}.`,
    link: `/admin/purchases`,
  }));
}

export async function notifyAdminRefundRequested({
  courseName,
  requesterName,
  amount,
  currency,
}: {
  courseName: string;
  requesterName: string;
  amount: number;
  currency: string;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_refund_requested",
    title: "Refund Requested",
    message: `${requesterName} requested a refund of ${currency} ${(amount / 100).toFixed(2)} for "${courseName}".`,
    link: `/admin/refunds`,
  }));
}

export async function notifyAdminCouponUsageThreshold({
  couponCode,
  redemptionCount,
  redemptionLimit,
}: {
  couponCode: string;
  redemptionCount: number;
  redemptionLimit: number;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_coupon_usage_threshold",
    title: "Coupon Usage Alert",
    message: `Coupon "${couponCode}" has reached ${redemptionCount}/${redemptionLimit} redemptions.`,
    link: `/admin/coupons`,
  }));
}

export async function notifyAdminTeamLicenseCreated({
  courseName,
  purchaserName,
  totalSeats,
}: {
  courseName: string;
  purchaserName: string;
  totalSeats: number;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_team_license_created",
    title: "Team License Purchased",
    message: `${purchaserName} purchased a team license for "${courseName}" with ${totalSeats} seats.`,
    link: `/admin/team-licenses`,
  }));
}

export async function notifyAdminCourseReviewMilestone({
  courseName,
  courseSlug,
  reviewCount,
}: {
  courseName: string;
  courseSlug: string;
  reviewCount: number;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_course_review_milestone",
    title: "Review Milestone Reached",
    message: `"${courseName}" has reached ${reviewCount} reviews!`,
    link: `/courses/${courseSlug}`,
  }));
}

export async function notifyAdminEnrollmentMilestone({
  courseName,
  courseSlug,
  enrollmentCount,
}: {
  courseName: string;
  courseSlug: string;
  enrollmentCount: number;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_enrollment_milestone",
    title: "Enrollment Milestone",
    message: `"${courseName}" has reached ${enrollmentCount} enrollments!`,
    link: `/courses/${courseSlug}`,
  }));
}

export async function notifyAdminNewUserRegistration({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_new_user_registration",
    title: "New User Registered",
    message: `${userName} (${userEmail}) has registered on the platform.`,
    link: `/admin/users`,
  }));
}

export async function notifyAdminChatMessageReported({
  reportId,
  channelId,
  reporterName,
  reason,
}: {
  reportId: string;
  channelId: string;
  reporterName: string;
  reason: string;
}) {
  return notifyAllAdmins((userId) => ({
    id: ulid(),
    userId,
    type: "admin_chat_message_reported",
    title: "Chat Message Reported",
    message: `${reporterName} reported a message in #${channelId} for: ${reason}`,
    link: `/admin/chat-reports`,
    chatMessageReportId: reportId,
  }));
}
