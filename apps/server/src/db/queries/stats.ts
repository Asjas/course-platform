import { count, eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { course } from "~/db/schema/course.js";
import { enrollment } from "~/db/schema/enrollment.js";

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
