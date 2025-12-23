import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { course, courseWishlist } from "~/db/schema/course.js";
import { enrollment } from "~/db/schema/enrollment.js";
import { supportTicket } from "~/db/schema/support-tickets.js";
import { user } from "~/db/schema/user.js";
import { coupon, couponRedemption } from "~/db/schema/coupon.js";
import { teamLicense, teamLicenseInvite } from "~/db/schema/teamLicense.js";
import { courseProgress, lessonProgress } from "~/db/schema/progress.js";
import { platformAnnouncement, platformAnnouncementRead } from "~/db/schema/platformAnnouncements.js";

/**
 * Get basic course statistics for admin dashboard
 */
export async function getCourseStats() {
  // Get total enrollments per course
  const enrollmentStats = await db
    .select({
      courseId: enrollment.courseId,
      totalEnrollments: count(enrollment.id).as("total_enrollments"),
      activeEnrollments:
        sql<number>`COUNT(CASE WHEN ${enrollment.status} = 'active' THEN 1 END)`.as(
          "active_enrollments",
        ),
      completedEnrollments:
        sql<number>`COUNT(CASE WHEN ${enrollment.status} = 'completed' THEN 1 END)`.as(
          "completed_enrollments",
        ),
    })
    .from(enrollment)
    .groupBy(enrollment.courseId);

  // Get course basic info
  const courses = await db
    .select({
      id: course.id,
      name: course.name,
      slug: course.slug,
      published: course.published,
      price: course.price,
      modulesCount: course.totalModules,
      lessonsCount: course.totalLessons,
    })
    .from(course);

  // Combine course info with enrollment stats
  const stats = courses.map((c) => {
    const enrollmentData = enrollmentStats.find((e) => e.courseId === c.id);
    return {
      ...c,
      totalEnrollments: enrollmentData?.totalEnrollments || 0,
      activeEnrollments: enrollmentData?.activeEnrollments || 0,
      completedEnrollments: enrollmentData?.completedEnrollments || 0,
      completionRate:
        enrollmentData && enrollmentData.totalEnrollments > 0
          ? Math.round(
              (enrollmentData.completedEnrollments /
                enrollmentData.totalEnrollments) *
                100,
            )
          : 0,
    };
  });

  return stats;
}

/**
 * Get overall platform statistics
 */
export async function getPlatformStats() {
  const [courseCount, enrollmentCount, activeEnrollmentCount] =
    await Promise.all([
      // Total courses
      db.select({ count: count() }).from(course),
      // Total enrollments
      db.select({ count: count() }).from(enrollment),
      // Active enrollments
      db
        .select({ count: count() })
        .from(enrollment)
        .where(eq(enrollment.status, "active")),
    ]);

  return {
    totalCourses: courseCount[0]?.count || 0,
    totalEnrollments: enrollmentCount[0]?.count || 0,
    activeEnrollments: activeEnrollmentCount[0]?.count || 0,
  };
}

/**
 * Get revenue and purchase statistics
 */
export async function getRevenueStats() {
  const { payment } = await import("~/db/schema/purchase.js");
  const { invoice } = await import("~/db/schema/purchase.js");

  // Get payment statistics
  const paymentStats = await db
    .select({
      totalRevenue: sql<number>`SUM(CASE WHEN ${payment.status} = 'completed' THEN ${payment.amount} ELSE 0 END)`.as(
        "total_revenue",
      ),
      refundedAmount: sql<number>`SUM(CASE WHEN ${payment.status} = 'refunded' THEN ${payment.amount} ELSE 0 END)`.as(
        "refunded_amount",
      ),
      totalPaid: count(payment.id)
        .as("total_paid")
        .mapWith((val) => (val === null ? 0 : Number(val))),
      refundCount:
        sql<number>`COUNT(CASE WHEN ${payment.status} = 'refunded' THEN 1 END)`.as(
          "refund_count",
        ),
      giftCount:
        sql<number>`COUNT(CASE WHEN ${payment.isGift} = true THEN 1 END)`.as(
          "gift_count",
        ),
      teamPurchaseCount:
        sql<number>`COUNT(CASE WHEN ${payment.purchaseType} = 'team' THEN 1 END)`.as(
          "team_purchase_count",
        ),
    })
    .from(payment);

  // Get enrollment type breakdown
  const enrollmentTypeStats = await db
    .select({
      individualCount:
        sql<number>`COUNT(CASE WHEN ${enrollment.enrollmentType} = 'individual' THEN 1 END)`.as(
          "individual_count",
        ),
      giftCount:
        sql<number>`COUNT(CASE WHEN ${enrollment.enrollmentType} = 'gift' THEN 1 END)`.as(
          "gift_count",
        ),
      teamCount:
        sql<number>`COUNT(CASE WHEN ${enrollment.enrollmentType} = 'team' THEN 1 END)`.as(
          "team_count",
        ),
      refundedCount:
        sql<number>`COUNT(CASE WHEN ${enrollment.status} = 'refunded' THEN 1 END)`.as(
          "refunded_count",
        ),
      cancelledCount:
        sql<number>`COUNT(CASE WHEN ${enrollment.status} = 'cancelled' THEN 1 END)`.as(
          "cancelled_count",
        ),
    })
    .from(enrollment);

  const stats = paymentStats[0];
  const enrollmentStats = enrollmentTypeStats[0];

  return {
    totalRevenue: Number(stats?.totalRevenue || 0),
    refundedAmount: Number(stats?.refundedAmount || 0),
    netRevenue: Number(stats?.totalRevenue || 0) - Number(stats?.refundedAmount || 0),
    totalPayments: Number(stats?.totalPaid || 0),
    refundCount: Number(stats?.refundCount || 0),
    refundRate:
      Number(stats?.totalPaid || 0) > 0
        ? Math.round((Number(stats?.refundCount || 0) / Number(stats?.totalPaid || 0)) * 100)
        : 0,
    giftPurchases: Number(stats?.giftCount || 0),
    teamPurchases: Number(stats?.teamPurchaseCount || 0),
    individualEnrollments: Number(enrollmentStats?.individualCount || 0),
    giftEnrollments: Number(enrollmentStats?.giftCount || 0),
    teamEnrollments: Number(enrollmentStats?.teamCount || 0),
    refundedEnrollments: Number(enrollmentStats?.refundedCount || 0),
    cancelledEnrollments: Number(enrollmentStats?.cancelledCount || 0),
  };
}

/**
 * Get support ticket statistics
 */
export async function getSupportStats() {
  const ticketStats = await db
    .select({
      totalTickets: count(supportTicket.id),
      openTickets:
        sql<number>`COUNT(CASE WHEN ${supportTicket.status} = 'open' THEN 1 END)`.as(
          "open_tickets",
        ),
      inProgressTickets:
        sql<number>`COUNT(CASE WHEN ${supportTicket.status} = 'in_progress' THEN 1 END)`.as(
          "in_progress_tickets",
        ),
      resolvedTickets:
        sql<number>`COUNT(CASE WHEN ${supportTicket.status} = 'resolved' THEN 1 END)`.as(
          "resolved_tickets",
        ),
      closedTickets:
        sql<number>`COUNT(CASE WHEN ${supportTicket.status} = 'closed' THEN 1 END)`.as(
          "closed_tickets",
        ),
      urgentTickets:
        sql<number>`COUNT(CASE WHEN ${supportTicket.priority} = 'urgent' THEN 1 END)`.as(
          "urgent_tickets",
        ),
      highPriorityTickets:
        sql<number>`COUNT(CASE WHEN ${supportTicket.priority} = 'high' THEN 1 END)`.as(
          "high_priority_tickets",
        ),
    })
    .from(supportTicket);

  const stats = ticketStats[0];

  return {
    totalTickets: Number(stats?.totalTickets || 0),
    openTickets: Number(stats?.openTickets || 0),
    inProgressTickets: Number(stats?.inProgressTickets || 0),
    resolvedTickets: Number(stats?.resolvedTickets || 0),
    closedTickets: Number(stats?.closedTickets || 0),
    urgentTickets: Number(stats?.urgentTickets || 0),
    highPriorityTickets: Number(stats?.highPriorityTickets || 0),
    activeTickets:
      Number(stats?.openTickets || 0) + Number(stats?.inProgressTickets || 0),
    resolutionRate:
      Number(stats?.totalTickets || 0) > 0
        ? Math.round(
            ((Number(stats?.resolvedTickets || 0) +
              Number(stats?.closedTickets || 0)) /
              Number(stats?.totalTickets || 0)) *
              100,
          )
        : 0,
  };
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  const userStats = await db
    .select({
      totalUsers: count(user.id),
      bannedUsers:
        sql<number>`COUNT(CASE WHEN ${user.banned} = true THEN 1 END)`.as(
          "banned_users",
        ),
      verifiedUsers:
        sql<number>`COUNT(CASE WHEN ${user.emailVerified} = true THEN 1 END)`.as(
          "verified_users",
        ),
      adminUsers:
        sql<number>`COUNT(CASE WHEN ${user.role} = 'admin' THEN 1 END)`.as(
          "admin_users",
        ),
    })
    .from(user);

  const stats = userStats[0];

  return {
    totalUsers: Number(stats?.totalUsers || 0),
    bannedUsers: Number(stats?.bannedUsers || 0),
    verifiedUsers: Number(stats?.verifiedUsers || 0),
    adminUsers: Number(stats?.adminUsers || 0),
    activeUsers: Number(stats?.totalUsers || 0) - Number(stats?.bannedUsers || 0),
    verificationRate:
      Number(stats?.totalUsers || 0) > 0
        ? Math.round(
            (Number(stats?.verifiedUsers || 0) / Number(stats?.totalUsers || 0)) *
              100,
          )
        : 0,
  };
}

/**
 * Get coupon and discount statistics
 */
export async function getCouponStats() {
  const [couponCounts, redemptionStats] = await Promise.all([
    db
      .select({
        totalCoupons: count(coupon.id),
        activeCoupons:
          sql<number>`COUNT(CASE WHEN ${coupon.active} = true THEN 1 END)`.as(
            "active_coupons",
          ),
      })
      .from(coupon),
    db
      .select({
        totalRedemptions: count(couponRedemption.id),
      })
      .from(couponRedemption),
  ]);

  const couponStats = couponCounts[0];
  const redemptions = redemptionStats[0];

  return {
    totalCoupons: Number(couponStats?.totalCoupons || 0),
    activeCoupons: Number(couponStats?.activeCoupons || 0),
    totalRedemptions: Number(redemptions?.totalRedemptions || 0),
    avgRedemptionsPerCoupon:
      Number(couponStats?.totalCoupons || 0) > 0
        ? Math.round(
            Number(redemptions?.totalRedemptions || 0) /
              Number(couponStats?.totalCoupons || 0),
          )
        : 0,
  };
}

/**
 * Get team license statistics
 */
export async function getTeamLicenseStats() {
  const [licenseStats, inviteStats] = await Promise.all([
    db
      .select({
        totalLicenses: count(teamLicense.id),
        totalSeats: sql<number>`SUM(${teamLicense.totalSeats})`.as("total_seats"),
        claimedSeats: sql<number>`SUM(${teamLicense.claimedSeats})`.as(
          "claimed_seats",
        ),
      })
      .from(teamLicense),
    db
      .select({
        totalInvites: count(teamLicenseInvite.id),
        pendingInvites:
          sql<number>`COUNT(CASE WHEN ${teamLicenseInvite.status} = 'pending' THEN 1 END)`.as(
            "pending_invites",
          ),
        claimedInvites:
          sql<number>`COUNT(CASE WHEN ${teamLicenseInvite.status} = 'claimed' THEN 1 END)`.as(
            "claimed_invites",
          ),
      })
      .from(teamLicenseInvite),
  ]);

  const license = licenseStats[0];
  const invite = inviteStats[0];

  return {
    totalLicenses: Number(license?.totalLicenses || 0),
    totalSeats: Number(license?.totalSeats || 0),
    claimedSeats: Number(license?.claimedSeats || 0),
    availableSeats:
      Number(license?.totalSeats || 0) - Number(license?.claimedSeats || 0),
    seatUtilization:
      Number(license?.totalSeats || 0) > 0
        ? Math.round(
            (Number(license?.claimedSeats || 0) / Number(license?.totalSeats || 0)) *
              100,
          )
        : 0,
    totalInvites: Number(invite?.totalInvites || 0),
    pendingInvites: Number(invite?.pendingInvites || 0),
    claimedInvites: Number(invite?.claimedInvites || 0),
  };
}

/**
 * Get progress and completion statistics
 */
export async function getProgressStats() {
  const [courseProgressStats, lessonProgressStats] = await Promise.all([
    db
      .select({
        totalCourseProgress: count(courseProgress.id),
        completedCourses:
          sql<number>`COUNT(CASE WHEN ${courseProgress.completed} = true THEN 1 END)`.as(
            "completed_courses",
          ),
        avgProgress: sql<number>`AVG(${courseProgress.progress})`.as("avg_progress"),
      })
      .from(courseProgress),
    db
      .select({
        totalLessonProgress: count(lessonProgress.id),
        completedLessons:
          sql<number>`COUNT(CASE WHEN ${lessonProgress.completed} = true THEN 1 END)`.as(
            "completed_lessons",
          ),
      })
      .from(lessonProgress),
  ]);

  const courseStats = courseProgressStats[0];
  const lessonStats = lessonProgressStats[0];

  return {
    totalCourseProgress: Number(courseStats?.totalCourseProgress || 0),
    completedCourses: Number(courseStats?.completedCourses || 0),
    avgCourseProgress: Math.round(Number(courseStats?.avgProgress || 0)),
    courseCompletionRate:
      Number(courseStats?.totalCourseProgress || 0) > 0
        ? Math.round(
            (Number(courseStats?.completedCourses || 0) /
              Number(courseStats?.totalCourseProgress || 0)) *
              100,
          )
        : 0,
    totalLessonProgress: Number(lessonStats?.totalLessonProgress || 0),
    completedLessons: Number(lessonStats?.completedLessons || 0),
    lessonCompletionRate:
      Number(lessonStats?.totalLessonProgress || 0) > 0
        ? Math.round(
            (Number(lessonStats?.completedLessons || 0) /
              Number(lessonStats?.totalLessonProgress || 0)) *
              100,
          )
        : 0,
  };
}

/**
 * Get wishlist statistics
 */
export async function getWishlistStats() {
  const [wishlistCounts, topWishlisted] = await Promise.all([
    db
      .select({
        totalWishlistItems: count(courseWishlist.id),
      })
      .from(courseWishlist),
    db
      .select({
        courseId: courseWishlist.courseId,
        courseName: course.name,
        wishlistCount: count(courseWishlist.id).as("wishlist_count"),
      })
      .from(courseWishlist)
      .leftJoin(course, eq(courseWishlist.courseId, course.id))
      .groupBy(courseWishlist.courseId, course.name)
      .orderBy(desc(count(courseWishlist.id)))
      .limit(5),
  ]);

  const wishlist = wishlistCounts[0];

  return {
    totalWishlistItems: Number(wishlist?.totalWishlistItems || 0),
    topWishlisted: topWishlisted.map((item) => ({
      courseId: item.courseId,
      courseName: item.courseName || "Unknown",
      count: Number(item.wishlistCount || 0),
    })),
  };
}

/**
 * Get platform announcement statistics
 */
export async function getAnnouncementStats() {
  const [announcementCounts, readStats] = await Promise.all([
    db
      .select({
        totalAnnouncements: count(platformAnnouncement.id),
        publishedAnnouncements:
          sql<number>`COUNT(CASE WHEN ${platformAnnouncement.publishedAt} IS NOT NULL THEN 1 END)`.as(
            "published_announcements",
          ),
      })
      .from(platformAnnouncement),
    db
      .select({
        totalReads: count(platformAnnouncementRead.id),
      })
      .from(platformAnnouncementRead),
  ]);

  const announcement = announcementCounts[0];
  const reads = readStats[0];

  return {
    totalAnnouncements: Number(announcement?.totalAnnouncements || 0),
    publishedAnnouncements: Number(announcement?.publishedAnnouncements || 0),
    totalReads: Number(reads?.totalReads || 0),
  };
}
