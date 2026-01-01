import * as z from "zod";
import { db } from "~/db/index.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

/**
 * Data export router for GDPR compliance
 * Allows users to download their personal data in JSON or CSV format
 */
export const dataExportRouter = router({
  /**
   * Export user data in JSON format
   * Includes: profile, enrollments, progress, purchases, notifications, messages
   */
  exportData: publicProcedure
    .input(
      z.object({
        format: z.enum(["json", "csv"]).default("json"),
      }),
    )
    .use(isAuthenticated)
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Fetch user profile data
      const userProfile = await db.query.user.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          email: true,
          emailVerified: true,
          image: true,
          role: true,
          color: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Fetch enrollments
      const enrollments = await db.query.enrollment.findMany({
        where: (enrollments, { eq }) => eq(enrollments.userId, userId),
        with: {
          course: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Fetch course progress
      const courseProgress = await db.query.courseProgress.findMany({
        where: (progress, { eq }) => eq(progress.userId, userId),
        with: {
          course: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Fetch lesson progress
      const lessonProgress = await db.query.lessonProgress.findMany({
        where: (progress, { eq }) => eq(progress.userId, userId),
        with: {
          lesson: {
            columns: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });

      // Fetch payments
      const payments = await db.query.payment.findMany({
        where: (payments, { eq }) => eq(payments.userId, userId),
        with: {
          course: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Fetch notifications
      const notifications = await db.query.userNotification.findMany({
        where: (notifications, { eq }) => eq(notifications.userId, userId),
      });

      // Fetch support tickets
      const supportTickets = await db.query.supportTicket.findMany({
        where: (tickets, { eq }) => eq(tickets.userId, userId),
      });

      // Fetch wishlists
      const wishlists = await db.query.courseWishlist.findMany({
        where: (wishlists, { eq }) => eq(wishlists.userId, userId),
        with: {
          course: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      const userData = {
        exportDate: new Date().toISOString(),
        profile: userProfile,
        enrollments,
        courseProgress,
        lessonProgress,
        payments,
        notifications,
        supportTickets,
        wishlists,
      };

      if (input.format === "json") {
        return {
          format: "json" as const,
          data: userData,
        };
      }

      // CSV format - convert to CSV string
      // For CSV, we'll create separate sections for each data type
      const csvSections: string[] = [];

      // Profile section
      if (userProfile) {
        csvSections.push("### User Profile");
        csvSections.push(
          "ID,Name,Username,Display Username,Email,Email Verified,Role,Created At,Updated At",
        );
        csvSections.push(
          [
            userProfile.id,
            userProfile.name,
            userProfile.username || "",
            userProfile.displayUsername || "",
            userProfile.email,
            userProfile.emailVerified,
            userProfile.role,
            userProfile.createdAt,
            userProfile.updatedAt,
          ].join(","),
        );
        csvSections.push("");
      }

      // Enrollments section
      if (enrollments.length > 0) {
        csvSections.push("### Enrollments");
        csvSections.push(
          "Enrollment ID,Course Name,Course Slug,Status,Enrollment Type,Enrolled At,Created At",
        );
        enrollments.forEach((enrollment) => {
          csvSections.push(
            [
              enrollment.id,
              enrollment.course.name,
              enrollment.course.slug,
              enrollment.status,
              enrollment.enrollmentType,
              enrollment.enrolledAt,
              enrollment.createdAt,
            ].join(","),
          );
        });
        csvSections.push("");
      }

      // Course Progress section
      if (courseProgress.length > 0) {
        csvSections.push("### Course Progress");
        csvSections.push(
          "Progress ID,Course Name,Course Slug,Progress,Completed,Started At,Completed At,Last Accessed At",
        );
        courseProgress.forEach((progress) => {
          csvSections.push(
            [
              progress.id,
              progress.course.name,
              progress.course.slug,
              progress.progress,
              progress.completed,
              progress.startedAt || "",
              progress.completedAt || "",
              progress.lastAccessedAt || "",
            ].join(","),
          );
        });
        csvSections.push("");
      }

      // Lesson Progress section
      if (lessonProgress.length > 0) {
        csvSections.push("### Lesson Progress");
        csvSections.push(
          "Progress ID,Lesson Title,Lesson Slug,Percent Complete,Completed,Completed At,Last Accessed At",
        );
        lessonProgress.forEach((progress) => {
          csvSections.push(
            [
              progress.id,
              progress.lesson.title,
              progress.lesson.slug,
              progress.percentComplete,
              progress.completed,
              progress.completedAt || "",
              progress.lastAccessedAt || "",
            ].join(","),
          );
        });
        csvSections.push("");
      }

      // Payments section
      if (payments.length > 0) {
        csvSections.push("### Payments");
        csvSections.push(
          "Payment ID,Course Name,Amount,Currency,Status,Transaction ID,Paid At,Created At",
        );
        payments.forEach((payment) => {
          csvSections.push(
            [
              payment.id,
              payment.course.name,
              payment.amount,
              payment.currency,
              payment.status,
              payment.transactionId,
              payment.paidAt || "",
              payment.createdAt,
            ].join(","),
          );
        });
        csvSections.push("");
      }

      // Notifications section
      if (notifications.length > 0) {
        csvSections.push("### Notifications");
        csvSections.push("Notification ID,Type,Title,Read At,Created At");
        notifications.forEach((notification) => {
          csvSections.push(
            [
              notification.id,
              notification.type,
              notification.title,
              notification.readAt || "",
              notification.createdAt,
            ].join(","),
          );
        });
        csvSections.push("");
      }

      // Support Tickets section
      if (supportTickets.length > 0) {
        csvSections.push("### Support Tickets");
        csvSections.push(
          "Ticket ID,Title,Status,Priority,Created At,Updated At",
        );
        supportTickets.forEach((ticket) => {
          csvSections.push(
            [
              ticket.id,
              ticket.title,
              ticket.status,
              ticket.priority,
              ticket.createdAt,
              ticket.updatedAt,
            ].join(","),
          );
        });
        csvSections.push("");
      }

      // Wishlist section
      if (wishlists.length > 0) {
        csvSections.push("### Course Wishlist");
        csvSections.push("Wishlist ID,Course Name,Course Slug,Added At");
        wishlists.forEach((wishlist) => {
          csvSections.push(
            [
              wishlist.id,
              wishlist.course.name,
              wishlist.course.slug,
              wishlist.createdAt,
            ].join(","),
          );
        });
        csvSections.push("");
      }

      const csvContent = csvSections.join("\n");

      return {
        format: "csv" as const,
        data: csvContent,
      };
    }),
});
