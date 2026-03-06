import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  CheckCircle,
  Clock,
  DollarSign,
  Gift,
  Heart,
  RefreshCw,
  Tag,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound,
  XCircle,
} from "lucide-react";
import { trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/admin/stats")({
  loader: async () => {
    const [
      platformStats,
      courseStats,
      revenueStats,
      supportStats,
      userStats,
      couponStats,
      teamLicenseStats,
      progressStats,
      wishlistStats,
      announcementStats,
    ] = await Promise.all([
      trpcClient.stats.getPlatformStats.query(),
      trpcClient.stats.getCourseStats.query(),
      trpcClient.stats.getRevenueStats.query(),
      trpcClient.stats.getSupportStats.query(),
      trpcClient.stats.getUserStats.query(),
      trpcClient.stats.getCouponStats.query(),
      trpcClient.stats.getTeamLicenseStats.query(),
      trpcClient.stats.getProgressStats.query(),
      trpcClient.stats.getWishlistStats.query(),
      trpcClient.stats.getAnnouncementStats.query(),
    ]);

    return {
      platformStats,
      courseStats,
      revenueStats,
      supportStats,
      userStats,
      couponStats,
      teamLicenseStats,
      progressStats,
      wishlistStats,
      announcementStats,
    };
  },
  component: StatsPage,
});

function StatsPage() {
  const {
    platformStats,
    courseStats,
    revenueStats,
    supportStats,
    userStats,
    couponStats,
    teamLicenseStats,
    progressStats,
    wishlistStats,
    announcementStats,
  } = Route.useLoaderData();

  // Format currency
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-6 pb-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Platform Statistics
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of course enrollments and platform activity
        </p>
      </header>

      {/* Platform Overview Cards */}
      <section aria-labelledby="platform-overview-heading">
        <h2
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
          id="platform-overview-heading"
        >
          Platform Overview
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformStats.totalCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Enrollments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformStats.totalEnrollments}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Enrollments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformStats.activeEnrollments}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="border-t border-gray-200 dark:border-gray-700"
        aria-hidden="true"
      />

      {/* Revenue & Purchase Statistics */}
      <section aria-labelledby="revenue-heading">
        <h2
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
          id="revenue-heading"
        >
          Revenue & Purchases
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Net Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenueStats.netRevenue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatCurrency(revenueStats.totalRevenue)} total
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <RefreshCw className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Refunds
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {revenueStats.refundCount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {revenueStats.refundRate}% rate •{" "}
                  {formatCurrency(revenueStats.refundedAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-pink-100 p-3 dark:bg-pink-900">
                <Gift className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Gift Purchases
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {revenueStats.giftPurchases}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {revenueStats.giftEnrollments} redeemed
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <UsersRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Team Licenses
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {revenueStats.teamPurchases}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {revenueStats.teamEnrollments} seats used
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Type Breakdown */}
      <section aria-labelledby="enrollment-breakdown-heading">
        <h2
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
          id="enrollment-breakdown-heading"
        >
          Enrollment Breakdown
        </h2>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Individual
              </p>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {revenueStats.individualEnrollments}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {platformStats.totalEnrollments > 0
                ? Math.round(
                    (revenueStats.individualEnrollments /
                      platformStats.totalEnrollments) *
                      100,
                  )
                : 0}
              % of total
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Gift
              </p>
              <Gift className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {revenueStats.giftEnrollments}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {platformStats.totalEnrollments > 0
                ? Math.round(
                    (revenueStats.giftEnrollments /
                      platformStats.totalEnrollments) *
                      100,
                  )
                : 0}
              % of total
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Team
              </p>
              <UsersRound className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {revenueStats.teamEnrollments}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {platformStats.totalEnrollments > 0
                ? Math.round(
                    (revenueStats.teamEnrollments /
                      platformStats.totalEnrollments) *
                      100,
                  )
                : 0}
              % of total
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Refunded
              </p>
              <RefreshCw className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {revenueStats.refundedEnrollments}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {platformStats.totalEnrollments > 0
                ? Math.round(
                    (revenueStats.refundedEnrollments /
                      platformStats.totalEnrollments) *
                      100,
                  )
                : 0}
              % of total
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Cancelled
              </p>
              <XCircle className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {revenueStats.cancelledEnrollments}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {platformStats.totalEnrollments > 0
                ? Math.round(
                    (revenueStats.cancelledEnrollments /
                      platformStats.totalEnrollments) *
                      100,
                  )
                : 0}
              % of total
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="border-t border-gray-200 dark:border-gray-700"
        aria-hidden="true"
      />

      {/* User Statistics */}
      <section aria-labelledby="user-activity-heading">
        <h2
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
          id="user-activity-heading"
        >
          User Activity
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.totalUsers}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {userStats.activeUsers} active
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Verified Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.verifiedUsers}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {userStats.verificationRate}% verified
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Admin Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.adminUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Banned Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.bannedUsers}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Tickets */}
      <section aria-labelledby="support-tickets-heading">
        <h2
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
          id="support-tickets-heading"
        >
          Support Tickets
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                <Ticket className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Tickets
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {supportStats.totalTickets}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {supportStats.activeTickets} active
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Urgent
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {supportStats.urgentTickets}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {supportStats.highPriorityTickets} high priority
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {supportStats.inProgressTickets}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {supportStats.openTickets} open
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Resolution Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {supportStats.resolutionRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {supportStats.resolvedTickets} resolved
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Progress */}
      <section aria-labelledby="learning-progress-heading">
        <h2
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
          id="learning-progress-heading"
        >
          Learning Progress
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Course Completion
              </p>
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {progressStats.courseCompletionRate}%
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {progressStats.completedCourses} /{" "}
              {progressStats.totalCourseProgress} completed
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Course Progress
              </p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {progressStats.avgCourseProgress}%
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              across all enrolled users
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Lesson Completion
              </p>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {progressStats.lessonCompletionRate}%
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {progressStats.completedLessons} /{" "}
              {progressStats.totalLessonProgress} lessons
            </p>
          </div>
        </div>
      </section>

      {/* Additional Metrics */}
      <section aria-labelledby="additional-metrics-heading">
        <h2
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
          id="additional-metrics-heading"
        >
          Additional Metrics
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Coupons
              </p>
              <Tag className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {couponStats.activeCoupons}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {couponStats.totalRedemptions} redemptions
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Team Seats
              </p>
              <UsersRound className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {teamLicenseStats.seatUtilization}%
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {teamLicenseStats.claimedSeats} / {teamLicenseStats.totalSeats}{" "}
              claimed
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Wishlisted
              </p>
              <Heart className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {wishlistStats.totalWishlistItems}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              total wishlist items
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Announcements
              </p>
              <Bell className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {announcementStats.publishedAnnouncements}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {announcementStats.totalReads} reads
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="border-t border-gray-200 dark:border-gray-700"
        aria-hidden="true"
      />

      {/* Course Statistics Table */}
      <section aria-labelledby="course-stats-heading">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2
              className="text-xl font-semibold text-gray-900 dark:text-white"
              id="course-stats-heading"
            >
              Course Statistics
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Detailed statistics for all courses including enrollments,
                completion rates, and content metrics
              </caption>
              <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-700 uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th
                    className="px-6 py-3"
                    scope="col"
                  >
                    Course Name
                  </th>
                  <th
                    className="px-6 py-3"
                    scope="col"
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3"
                    scope="col"
                  >
                    Price
                  </th>
                  <th
                    className="px-6 py-3 text-center"
                    scope="col"
                  >
                    Modules
                  </th>
                  <th
                    className="px-6 py-3 text-center"
                    scope="col"
                  >
                    Lessons
                  </th>
                  <th
                    className="px-6 py-3 text-center"
                    scope="col"
                  >
                    Total Enrollments
                  </th>
                  <th
                    className="px-6 py-3 text-center"
                    scope="col"
                  >
                    Active
                  </th>
                  <th
                    className="px-6 py-3 text-center"
                    scope="col"
                  >
                    Completed
                  </th>
                  <th
                    className="px-6 py-3 text-center"
                    scope="col"
                  >
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {courseStats.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      colSpan={9}
                    >
                      No courses found
                    </td>
                  </tr>
                ) : (
                  courseStats.map((course: (typeof courseStats)[number]) => (
                    <tr
                      className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      key={course.id}
                    >
                      <th
                        className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"
                        scope="row"
                      >
                        {course.name}
                      </th>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            course.published
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {course.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        ${course.price}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                        {course.modulesCount}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                        {course.lessonsCount}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">
                        {course.totalEnrollments}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                        {course.activeEnrollments}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                        {course.completedEnrollments}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {course.completionRate}%
                          </span>
                          {course.completionRate > 0 && (
                            <TrendingUp
                              className={`h-4 w-4 ${
                                course.completionRate >= 50
                                  ? "text-green-600"
                                  : course.completionRate >= 25
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
