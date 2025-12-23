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
