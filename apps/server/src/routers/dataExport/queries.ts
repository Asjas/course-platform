import { db } from "~/db/index.js";

/**
 * Fetch all user data for GDPR export
 * This includes all personal data as required by GDPR Article 15
 */
export async function getAllUserData(userId: string) {
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

  // Fetch course reviews
  const reviews = await db.query.courseReview.findMany({
    where: (reviews, { eq }) => eq(reviews.userId, userId),
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

  // Fetch direct message requests (sent and received)
  const dmRequestsSent = await db.query.directMessageRequest.findMany({
    where: (requests, { eq }) => eq(requests.requesterId, userId),
  });

  const dmRequestsReceived = await db.query.directMessageRequest.findMany({
    where: (requests, { eq }) => eq(requests.recipientId, userId),
  });

  // Fetch direct message conversations
  const dmConversations = await db.query.directMessageConversation.findMany({
    where: (conversations, { or, eq }) =>
      or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)),
  });

  // Fetch completion certificates
  const certificates = await db.query.courseCompletionCertificate.findMany({
    where: (certificates, { eq }) => eq(certificates.userId, userId),
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

  // Fetch chat message reports (reports made by user)
  const chatReports = await db.query.chatMessageReport.findMany({
    where: (reports, { eq }) => eq(reports.reportedBy, userId),
  });

  return {
    userProfile,
    enrollments,
    courseProgress,
    lessonProgress,
    payments,
    notifications,
    supportTickets,
    wishlists,
    reviews,
    dmRequestsSent,
    dmRequestsReceived,
    dmConversations,
    certificates,
    chatReports,
  };
}

// Type exports using Awaited<ReturnType<>> pattern
export type AllUserData = Awaited<ReturnType<typeof getAllUserData>>;
