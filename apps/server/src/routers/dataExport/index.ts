import { createCsvSection } from "./csvUtils.js";
import { type AllUserData, getAllUserData } from "./queries.js";
import { checkExportRateLimit } from "./rateLimit.js";
import * as z from "zod";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

/**
 * Data export response type
 */
type DataExportResponse =
  | {
      format: "json";
      data: AllUserData & { exportDate: string };
    }
  | {
      format: "csv";
      data: string;
    };

/**
 * Data export router for GDPR compliance
 * Allows users to download their personal data in JSON or CSV format
 */
export const dataExportRouter = router({
  /**
   * Export user data in JSON or CSV format
   * Includes: profile, enrollments, progress, purchases, notifications, reviews, messages, certificates
   */
  exportData: publicProcedure
    .input(
      z.object({
        format: z.enum(["json", "csv"]).default("json"),
      }),
    )
    .use(isAuthenticated)
    .query(async ({ ctx, input }): Promise<DataExportResponse> => {
      const userId = ctx.user.id;

      // Rate limiting - prevent abuse (uses Redis like Fastify's rate-limit plugin)
      await checkExportRateLimit(userId);

      // Audit logging for GDPR compliance
      ctx.request.log.info(
        {
          userId,
          format: input.format,
          timestamp: new Date().toISOString(),
        },
        "User data export requested",
      );

      try {
        // Fetch all user data
        const allUserData = await getAllUserData(userId);

        const exportData = {
          exportDate: new Date().toISOString(),
          ...allUserData,
        };

        // JSON format - return structured data
        if (input.format === "json") {
          ctx.request.log.info({ userId }, "User data export completed (JSON)");
          return {
            format: "json" as const,
            data: exportData,
          };
        }

        // CSV format - convert to CSV string with proper escaping
        const csvSections: string[] = [];

        // Profile section
        if (allUserData.userProfile) {
          const profile = allUserData.userProfile;
          csvSections.push(
            ...createCsvSection(
              "User Profile",
              [
                "ID",
                "Name",
                "Username",
                "Display Username",
                "Email",
                "Email Verified",
                "Role",
                "Created At",
                "Updated At",
              ],
              [
                [
                  profile.id,
                  profile.name,
                  profile.username || "",
                  profile.displayUsername || "",
                  profile.email,
                  profile.emailVerified,
                  profile.role,
                  profile.createdAt,
                  profile.updatedAt,
                ],
              ],
            ),
          );
        }

        // Enrollments section
        csvSections.push(
          ...createCsvSection(
            "Enrollments",
            [
              "Enrollment ID",
              "Course Name",
              "Course Slug",
              "Status",
              "Enrollment Type",
              "Enrolled At",
              "Created At",
            ],
            allUserData.enrollments.map((enrollment) => [
              enrollment.id,
              enrollment.course.name,
              enrollment.course.slug,
              enrollment.status,
              enrollment.enrollmentType,
              enrollment.enrolledAt,
              enrollment.createdAt,
            ]),
          ),
        );

        // Course Progress section
        csvSections.push(
          ...createCsvSection(
            "Course Progress",
            [
              "Progress ID",
              "Course Name",
              "Course Slug",
              "Progress",
              "Completed",
              "Started At",
              "Completed At",
              "Last Accessed At",
            ],
            allUserData.courseProgress.map((progress) => [
              progress.id,
              progress.course.name,
              progress.course.slug,
              progress.progress,
              progress.completed,
              progress.startedAt || "",
              progress.completedAt || "",
              progress.lastAccessedAt || "",
            ]),
          ),
        );

        // Lesson Progress section
        csvSections.push(
          ...createCsvSection(
            "Lesson Progress",
            [
              "Progress ID",
              "Lesson Title",
              "Lesson Slug",
              "Percent Complete",
              "Completed",
              "Completed At",
              "Last Accessed At",
            ],
            allUserData.lessonProgress.map((progress) => [
              progress.id,
              progress.lesson.title,
              progress.lesson.slug,
              progress.percentComplete,
              progress.completed,
              progress.completedAt || "",
              progress.lastAccessedAt || "",
            ]),
          ),
        );

        // Payments section
        csvSections.push(
          ...createCsvSection(
            "Payments",
            [
              "Payment ID",
              "Course Name",
              "Amount",
              "Currency",
              "Status",
              "Transaction ID",
              "Paid At",
              "Created At",
            ],
            allUserData.payments.map((payment) => [
              payment.id,
              payment.course.name,
              payment.amount,
              payment.currency,
              payment.status,
              payment.transactionId,
              payment.paidAt || "",
              payment.createdAt,
            ]),
          ),
        );

        // Notifications section
        csvSections.push(
          ...createCsvSection(
            "Notifications",
            ["Notification ID", "Type", "Title", "Read At", "Created At"],
            allUserData.notifications.map((notification) => [
              notification.id,
              notification.type,
              notification.title,
              notification.readAt || "",
              notification.createdAt,
            ]),
          ),
        );

        // Support Tickets section
        csvSections.push(
          ...createCsvSection(
            "Support Tickets",
            [
              "Ticket ID",
              "Title",
              "Status",
              "Priority",
              "Created At",
              "Updated At",
            ],
            allUserData.supportTickets.map((ticket) => [
              ticket.id,
              ticket.title,
              ticket.status,
              ticket.priority,
              ticket.createdAt,
              ticket.updatedAt,
            ]),
          ),
        );

        // Wishlist section
        csvSections.push(
          ...createCsvSection(
            "Course Wishlist",
            ["Wishlist ID", "Course Name", "Course Slug", "Added At"],
            allUserData.wishlists.map((wishlist) => [
              wishlist.id,
              wishlist.course.name,
              wishlist.course.slug,
              wishlist.createdAt,
            ]),
          ),
        );

        // Course Reviews section
        csvSections.push(
          ...createCsvSection(
            "Course Reviews",
            [
              "Review ID",
              "Course Name",
              "Rating",
              "Title",
              "Comment",
              "Approved",
              "Created At",
            ],
            allUserData.reviews.map((review) => [
              review.id,
              review.course.name,
              review.rating || "",
              review.title,
              review.comment,
              review.approved,
              review.createdAt,
            ]),
          ),
        );

        // Direct Message Requests Sent section
        csvSections.push(
          ...createCsvSection(
            "Direct Message Requests Sent",
            [
              "Request ID",
              "Recipient ID",
              "Message",
              "Status",
              "Created At",
              "Responded At",
            ],
            allUserData.dmRequestsSent.map((request) => [
              request.id,
              request.recipientId,
              request.message,
              request.status,
              request.createdAt,
              request.respondedAt || "",
            ]),
          ),
        );

        // Direct Message Requests Received section
        csvSections.push(
          ...createCsvSection(
            "Direct Message Requests Received",
            [
              "Request ID",
              "Requester ID",
              "Message",
              "Status",
              "Created At",
              "Responded At",
            ],
            allUserData.dmRequestsReceived.map((request) => [
              request.id,
              request.requesterId,
              request.message,
              request.status,
              request.createdAt,
              request.respondedAt || "",
            ]),
          ),
        );

        // Direct Message Conversations section
        csvSections.push(
          ...createCsvSection(
            "Direct Message Conversations",
            [
              "Conversation ID",
              "User 1 ID",
              "User 2 ID",
              "User 1 Closed",
              "User 2 Closed",
              "Created At",
            ],
            allUserData.dmConversations.map((conversation) => [
              conversation.id,
              conversation.user1Id,
              conversation.user2Id,
              conversation.user1Closed,
              conversation.user2Closed,
              conversation.createdAt,
            ]),
          ),
        );

        // Completion Certificates section
        csvSections.push(
          ...createCsvSection(
            "Course Completion Certificates",
            [
              "Certificate ID",
              "Course Name",
              "Issued At",
              "Certificate URL",
              "Created At",
            ],
            allUserData.certificates.map((cert) => [
              cert.id,
              cert.course.name,
              cert.issuedAt,
              cert.certificateUrl,
              cert.createdAt,
            ]),
          ),
        );

        // Chat Message Reports section
        csvSections.push(
          ...createCsvSection(
            "Chat Message Reports",
            [
              "Report ID",
              "Message ID",
              "Channel ID",
              "Reason",
              "Status",
              "Created At",
            ],
            allUserData.chatReports.map((report) => [
              report.id,
              report.messageId,
              report.channelId,
              report.reason,
              report.status,
              report.createdAt,
            ]),
          ),
        );

        const csvContent = csvSections.join("\n");

        ctx.request.log.info({ userId }, "User data export completed (CSV)");

        return {
          format: "csv" as const,
          data: csvContent,
        };
      } catch (error) {
        ctx.request.log.error(
          { userId, error, format: input.format },
          "User data export failed",
        );
        throw error;
      }
    }),
});
