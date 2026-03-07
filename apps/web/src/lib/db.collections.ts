import type { AllGdprAuditLogs } from "@apps/server/src/db/queries/gdprAudit";
import type { PublishedAnnouncements } from "@apps/server/src/db/queries/platformAnnouncements";
import type {
  ChannelMessages,
  DMMessages,
  ThreadReplies,
} from "@apps/server/src/routers/chat/queries";
import type { AllChatReports } from "@apps/server/src/routers/chatReports/queries";
import type { CouponsReturnType } from "@apps/server/src/routers/coupons/queries";
import type {
  AllCourses,
  AllCoursesAsAdmin,
  CourseById,
} from "@apps/server/src/routers/courses/queries";
import type { SearchableUsers } from "@apps/server/src/routers/directMessages/queries";
import type { AllPurchases } from "@apps/server/src/routers/purchases/queries";
import type { AllReviews } from "@apps/server/src/routers/reviews/queries";
import type { AllSupportTickets } from "@apps/server/src/routers/support-tickets/queries";
import type { AllSyncStatuses } from "@apps/server/src/routers/syncStatus/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection, eq, gt, useLiveQuery } from "@tanstack/react-db";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ulid } from "ulid";
import { getBackendErrorMessage } from "~/lib/api-error";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type SupportTicket = AllSupportTickets[number];
type Coupon = CouponsReturnType[number];
type Review = AllReviews[number];
export type ChatReport = AllChatReports[number];

// Announcement type from server - exported for use in components
export type Announcement = PublishedAnnouncements[number];

// Course type that supports both list (getAllCourses) and detail (getCourseById) data
// The collection starts with getAllCourses data, but may be updated with getCourseById data
// which includes modules with nested lessons
type CourseFromList = AllCourses[number];

// Type for user-facing course detail with full structure (modules + lessons)
export type CourseWithModulesAndLessons = NonNullable<CourseById>;

// Union type to support both shapes - the collection may contain either
type Course = CourseFromList | CourseWithModulesAndLessons;

// Type for admin queries that always return full course details
export type AdminCourseDetail = AllCoursesAsAdmin[number];

export const SupportTicketsCollection = createCollection(
  queryCollectionOptions<SupportTicket>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.supportTickets.getAll.queryKey(),
    queryFn: () => trpcClient.supportTickets.getAll.query(),
    onInsert: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.supportTickets.createSupportTicket.mutate(modified);
      } catch (error) {
        console.error("Error inserting support ticket: ", error);
        toast.error(
          getBackendErrorMessage(
            error,
            "An error occurred while creating the support ticket. Please try again.",
          ),
        );
        throw error;
      }
    },
    onDelete: async ({ transaction }) => {
      try {
        const { original } = transaction.mutations[0];

        // @ts-ignore Property 'deleteSupportTicket' does not exist
        await trpcClient.supportTickets.deleteSupportTicket.mutate({
          ticketId: original.id,
        });
      } catch (error) {
        console.error("Error deleting support ticket: ", error);
        toast.error(
          getBackendErrorMessage(
            error,
            "An error occurred while deleting the support ticket. Please try again.",
          ),
        );
        throw error;
      }
    },
  }),
);

export const CouponsCollection = createCollection(
  queryCollectionOptions<Coupon>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.coupons.getAll.queryKey(),
    queryFn: () => trpcClient.coupons.getAll.query(),
    onInsert: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.coupons.insertCoupon.mutate(modified);
      } catch (error) {
        console.error("Error inserting coupon: ", error);
        toast.error(
          "An error occurred while creating the coupon. Please try again.",
        );
        throw error;
      }
    },
    onUpdate: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.coupons.updateCouponById.mutate({
          id: modified.id,
          active: modified.active,
          code: modified.code,
          courseId: modified.courseId,
          description: modified.description,
          discountType: modified.discountType,
          discountValue: modified.discountValue,
          maxRedemptions: modified.redemptionLimit,
          validFrom: new Date(modified.validFrom),
          validTo: modified.validUntil ? new Date(modified.validUntil) : null,
        });
      } catch (error) {
        console.error("Error updating coupon: ", error);
        toast.error(
          "An error occurred while updating the coupon. Please try again.",
        );
        throw error;
      }
    },
    onDelete: async ({ transaction }) => {
      try {
        const { original } = transaction.mutations[0];

        await trpcClient.coupons.deleteCouponById.mutate({
          couponId: original.id,
        });
      } catch (error) {
        console.error("Error deleting coupon: ", error);
        toast.error(
          "An error occurred while deleting the coupon. Please try again.",
        );
        throw error;
      }
    },
  }),
);

export function useSupportTickets() {
  return useLiveQuery(SupportTicketsCollection);
}

export function useSupportTicketsByCourseId({
  courseId,
}: {
  courseId: string;
}) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ supportTicket: SupportTicketsCollection })
        .where(({ supportTicket }) => eq(supportTicket.courseId, courseId))
        .select(({ supportTicket }) => supportTicket);
    },
    [courseId],
  );
}

export function useSupportTicketById({ ticketId }: { ticketId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ supportTicket: SupportTicketsCollection })
        .where(({ supportTicket }) => eq(supportTicket.id, ticketId))
        .findOne();
    },
    [ticketId],
  );
}

export function useCoupons() {
  return useLiveQuery(CouponsCollection);
}

export function useCouponById({ couponId }: { couponId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ coupon: CouponsCollection })
        .where(({ coupon }) => eq(coupon.id, couponId))
        .findOne();
    },
    [couponId],
  );
}

//Announcements Collection
export const AnnouncementsCollection = createCollection(
  queryCollectionOptions<Announcement>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.announcements.getPublished.queryKey(),
    queryFn: () => trpcClient.announcements.getPublished.query(),
  }),
);

export function useAnnouncements() {
  return useLiveQuery(AnnouncementsCollection);
}

//Announcements Collection - User-specific queries
export function useUnreadAnnouncements({ userId }: { userId: string }) {
  return useQuery({
    ...trpc.announcements.getUnreadForUser.queryOptions(userId),
    refetchInterval: 30000, // Poll every 30 seconds for new announcements
    refetchIntervalInBackground: true,
  });
}

export function useReadAnnouncements({ userId }: { userId: string }) {
  return useQuery(trpc.announcements.getReadForUser.queryOptions(userId));
}

export async function markAnnouncementAsRead({
  announcementId,
  userId,
}: {
  announcementId: string;
  userId: string;
}) {
  try {
    await trpcClient.announcements.markAsRead.mutate({
      id: ulid(),
      announcementId,
      userId,
    });

    // Invalidate both the published collection and user-specific queries
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: trpc.announcements.getPublished.queryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.announcements.getUnreadForUser.queryKey(userId),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.announcements.getReadForUser.queryKey(userId),
      }),
    ]);

    toast.success("Announcement dismissed");
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    toast.error("Failed to dismiss announcement");
    throw error;
  }
}

// User Notifications - for support ticket comments and other user-specific notifications
export type UserNotification = Awaited<
  ReturnType<typeof trpcClient.notifications.getUnreadForUser.query>
>[number];

export function useUnreadUserNotifications({ userId }: { userId: string }) {
  return useQuery({
    ...trpc.notifications.getUnreadForUser.queryOptions(userId),
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
    refetchIntervalInBackground: true,
  });
}

export function useReadUserNotifications({ userId }: { userId: string }) {
  return useQuery(trpc.notifications.getReadForUser.queryOptions(userId));
}

export async function markUserNotificationAsRead({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) {
  try {
    await trpcClient.notifications.markAsRead.mutate({
      notificationId,
      userId,
    });

    // Invalidate user notification queries
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: trpc.notifications.getUnreadForUser.queryKey(userId),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.notifications.getReadForUser.queryKey(userId),
      }),
    ]);

    toast.success("Notification dismissed");
  } catch (error) {
    console.error("Error marking notification as read:", error);
    toast.error("Failed to dismiss notification");
    throw error;
  }
}

export const CoursesCollection = createCollection(
  queryCollectionOptions<Course>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.courses.getAll.queryKey(),
    queryFn: () => trpcClient.courses.getAll.query(),
  }),
);

// Admin collection with full CRUD operations
export const CoursesAdminCollection = createCollection(
  queryCollectionOptions<AdminCourseDetail>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: ["admin", "courses"],
    queryFn: () => trpcClient.courses.getAllAsAdmin.query(),
  }),
);

export const CourseProgressCollection = createCollection(
  queryCollectionOptions<{ id: string }>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: ["courseProgress"],
    queryFn: async () => {
      // This will be empty initially and populated per course
      return [];
    },
  }),
);

export const LessonProgressCollection = createCollection(
  queryCollectionOptions<{ id: string }>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: ["lessonProgress"],
    queryFn: async () => {
      // This will be empty initially and populated per lesson
      return [];
    },
  }),
);

export function useCourses() {
  return useLiveQuery(CoursesCollection);
}

export function useCoursesAdmin() {
  return useLiveQuery(CoursesAdminCollection);
}

export function useCourseById({ courseId }: { courseId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ course: CoursesCollection })
        .where(({ course }) => eq(course.id, courseId))
        .findOne();
    },
    [courseId],
  );
}

// Reviews Collection
export const ReviewsCollection = createCollection(
  queryCollectionOptions<Review>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.reviews.getAll.queryKey(),
    queryFn: () => trpcClient.reviews.getAll.query(),
    onInsert: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        // User reviews always require a rating (admin reviews use createAdminReview)
        if (modified.rating === null) {
          throw new Error("Rating is required for user reviews");
        }

        await trpcClient.reviews.createReview.mutate({
          courseId: modified.courseId,
          rating: modified.rating,
          title: modified.title,
          comment: modified.comment,
        });
      } catch (error) {
        console.error("Error inserting review: ", error);
        throw error;
      }
    },
    onUpdate: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.reviews.updateReview.mutate({
          reviewId: modified.id,
          rating: modified.rating ?? undefined,
          title: modified.title,
          comment: modified.comment,
          externalLink: modified.externalLink,
          approved: modified.approved,
          reviewedAt: modified.reviewedAt
            ? new Date(modified.reviewedAt)
            : null,
        });
      } catch (error) {
        console.error("Error updating review: ", error);
        toast.error(
          "An error occurred while updating the review. Please try again.",
        );
        throw error;
      }
    },
    onDelete: async ({ transaction }) => {
      try {
        const { original } = transaction.mutations[0];

        await trpcClient.reviews.deleteReview.mutate({
          reviewId: original.id,
        });
      } catch (error) {
        console.error("Error deleting review: ", error);
        toast.error(
          "An error occurred while deleting the review. Please try again.",
        );
        throw error;
      }
    },
  }),
);

export function useReviews() {
  return useLiveQuery(ReviewsCollection);
}

export function useReviewById({ reviewId }: { reviewId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ review: ReviewsCollection })
        .where(({ review }) => eq(review.id, reviewId))
        .findOne();
    },
    [reviewId],
  );
}

// ========== Chat Reports ==========

export const ChatReportsCollection = createCollection(
  queryCollectionOptions<ChatReport>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.chatReports.getAll.queryKey(),
    queryFn: () => trpcClient.chatReports.getAll.query(),
  }),
);

export function useChatReports() {
  return useLiveQuery(ChatReportsCollection);
}

export function useChatReportById({ reportId }: { reportId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ report: ChatReportsCollection })
        .where(({ report }) => eq(report.id, reportId))
        .findOne();
    },
    [reportId],
  );
}

// ========== Searchable Users ==========

export type SearchableUser = SearchableUsers[number];

export const SearchableUsersCollection = createCollection(
  queryCollectionOptions<SearchableUser>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.directMessages.getSearchable.queryKey(),
    queryFn: () => trpcClient.directMessages.getSearchable.query(),
  }),
);

export function useSearchableUsers() {
  return useLiveQuery(SearchableUsersCollection);
}

// ========== Sync Status ==========

export type SyncStatusItem = AllSyncStatuses[number];

export const SyncStatusCollection = createCollection(
  queryCollectionOptions<SyncStatusItem>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.syncStatus.getAll.queryKey(),
    queryFn: () => trpcClient.syncStatus.getAll.query(),
    onUpdate: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.syncStatus.update.mutate({
          collectionName: modified.collectionName,
          lastSyncedAt: modified.lastSyncedAt
            ? new Date(modified.lastSyncedAt)
            : null,
          lastEventId: modified.lastEventId,
          syncState: modified.syncState,
          pendingUpdates: modified.pendingUpdates,
          errorMessage: modified.errorMessage,
          isOnline: modified.isOnline,
        });
      } catch (error) {
        console.error("Error updating sync status: ", error);
        throw error;
      }
    },
  }),
);

export function useSyncStatuses() {
  return useLiveQuery(SyncStatusCollection);
}

export function useSyncStatusByCollection({
  collectionName,
}: {
  collectionName: string;
}) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ syncStatus: SyncStatusCollection })
        .where(({ syncStatus }) =>
          eq(syncStatus.collectionName, collectionName),
        )
        .findOne();
    },
    [collectionName],
  );
}

// Derive single message types from array types
export type ChannelMessage = ChannelMessages[number];
export type DMMessage = DMMessages[number];
export type ThreadMessage = ThreadReplies[number];

// Union type for all chat messages
export type ChatMessage = ChannelMessage | DMMessage;

// Channel Messages Collection - stores messages for a specific channel
// Uses tRPC queryKey for proper cache integration
export function createChannelMessagesCollection(channelId: string) {
  return createCollection(
    queryCollectionOptions<ChannelMessage>({
      queryClient,
      getKey: (item) => item.id,
      queryKey: trpc.chat.getChannelHistory.queryKey({ channelId, limit: 50 }),
      queryFn: async () => {
        // Fetch from server using tRPC
        return trpcClient.chat.getChannelHistory.query({ channelId });
      },
      onInsert: async ({ transaction }) => {
        try {
          const { modified } = transaction.mutations[0];

          if (!modified.channelId) {
            throw new Error("Channel ID is required for channel messages");
          }

          await trpcClient.chat.postMessage.mutate({
            channelId: modified.channelId,
            message: modified.message,
          });
        } catch (error) {
          console.error("Error posting channel message: ", error);
          toast.error(
            "An error occurred while posting the message. Please try again.",
          );
          throw error;
        }
      },
      onDelete: async ({ transaction }) => {
        try {
          const { original } = transaction.mutations[0];

          await trpcClient.chat.deleteMessage.mutate({
            id: original.id,
          });
        } catch (error) {
          console.error("Error deleting message: ", error);
          toast.error(
            "An error occurred while deleting the message. Please try again.",
          );
          throw error;
        }
      },
      onUpdate: async ({ transaction }) => {
        try {
          const { original, modified } = transaction.mutations[0];

          // Skip editMessage call if only reactions changed (not the message text)
          // Reactions are synced separately via toggleReaction endpoint
          if (original.message === modified.message) {
            return;
          }

          await trpcClient.chat.editMessage.mutate({
            id: modified.id,
            message: modified.message,
          });
        } catch (error) {
          console.error("Error editing message: ", error);
          toast.error(
            "An error occurred while editing the message. Please try again.",
          );
          throw error;
        }
      },
    }),
  );
}

// DM Messages Collection - stores messages for a specific conversation
// Uses tRPC queryKey for proper cache integration
export function createDMMessagesCollection(conversationId: string) {
  return createCollection(
    queryCollectionOptions<DMMessage>({
      queryClient,
      getKey: (item) => item.id,
      queryKey: trpc.chat.getDMHistory.queryKey({ conversationId, limit: 50 }),
      queryFn: async () => {
        // Fetch from server using tRPC
        return trpcClient.chat.getDMHistory.query({ conversationId });
      },
      onInsert: async ({ transaction }) => {
        try {
          const { modified } = transaction.mutations[0];

          if (!modified.conversationId) {
            throw new Error("Conversation ID is required for DM messages");
          }

          await trpcClient.chat.postDMMessage.mutate({
            conversationId: modified.conversationId,
            message: modified.message,
          });
        } catch (error) {
          console.error("Error posting DM message: ", error);
          toast.error(
            "An error occurred while posting the message. Please try again.",
          );
          throw error;
        }
      },
      onDelete: async ({ transaction }) => {
        try {
          const { original } = transaction.mutations[0];

          await trpcClient.chat.deleteMessage.mutate({
            id: original.id,
          });
        } catch (error) {
          console.error("Error deleting message: ", error);
          toast.error(
            "An error occurred while deleting the message. Please try again.",
          );
          throw error;
        }
      },
      onUpdate: async ({ transaction }) => {
        try {
          const { original, modified } = transaction.mutations[0];

          // Skip editMessage call if only reactions changed (not the message text)
          // Reactions are synced separately via toggleReaction endpoint
          if (original.message === modified.message) {
            return;
          }

          await trpcClient.chat.editMessage.mutate({
            id: modified.id,
            message: modified.message,
          });
        } catch (error) {
          console.error("Error editing message: ", error);
          toast.error(
            "An error occurred while editing the message. Please try again.",
          );
          throw error;
        }
      },
    }),
  );
}

// Thread Messages Collection - stores replies for a specific parent message
// Uses tRPC queryKey for proper cache integration
export function createThreadMessagesCollection(
  channelId: string,
  parentMessageId: string,
) {
  return createCollection(
    queryCollectionOptions<ThreadMessage>({
      queryClient,
      getKey: (item) => item.id,
      queryKey: trpc.chat.getThreadReplies.queryKey({
        channelId,
        parentMessageId,
        limit: 50,
      }),
      queryFn: async () => {
        return trpcClient.chat.getThreadReplies.query({
          channelId,
          parentMessageId,
        });
      },
      onInsert: async ({ transaction }) => {
        try {
          const { modified } = transaction.mutations[0];

          if (!modified.channelId) {
            throw new Error("Channel ID is required for thread messages");
          }

          await trpcClient.chat.postMessage.mutate({
            channelId: modified.channelId,
            message: modified.message,
            parentMessageId: modified.parentMessageId,
          });
        } catch (error) {
          console.error("Error posting thread message: ", error);
          toast.error(
            "An error occurred while posting the reply. Please try again.",
          );
          throw error;
        }
      },
      onDelete: async ({ transaction }) => {
        try {
          const { original } = transaction.mutations[0];

          await trpcClient.chat.deleteMessage.mutate({
            id: original.id,
          });
        } catch (error) {
          console.error("Error deleting thread message: ", error);
          toast.error(
            "An error occurred while deleting the reply. Please try again.",
          );
          throw error;
        }
      },
      onUpdate: async ({ transaction }) => {
        try {
          const { original, modified } = transaction.mutations[0];

          if (original.message === modified.message) {
            return;
          }

          await trpcClient.chat.editMessage.mutate({
            id: modified.id,
            message: modified.message,
          });
        } catch (error) {
          console.error("Error editing thread message: ", error);
          toast.error(
            "An error occurred while editing the reply. Please try again.",
          );
          throw error;
        }
      },
    }),
  );
}

// ========== Purchases ===========

export type Purchase = AllPurchases[number];

export const PurchasesCollection = createCollection(
  queryCollectionOptions<Purchase>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.purchases.getAll.queryKey(),
    queryFn: () => trpcClient.purchases.getAll.query(),
  }),
);

export function usePurchases() {
  return useLiveQuery(PurchasesCollection);
}

export function usePurchaseById({ purchaseId }: { purchaseId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ purchase: PurchasesCollection })
        .where(({ purchase }) => eq(purchase.id, purchaseId))
        .findOne();
    },
    [purchaseId],
  );
}

export function useRefundedPurchases() {
  return useLiveQuery((query) => {
    return query
      .from({ purchase: PurchasesCollection })
      .where(({ purchase }) => gt(purchase.refundedAmount, 0))
      .select(({ purchase }) => purchase);
  });
}

export function useActivePurchases() {
  return useLiveQuery((query) => {
    return query
      .from({ purchase: PurchasesCollection })
      .where(({ purchase }) => eq(purchase.refundedAmount, 0))
      .select(({ purchase }) => purchase);
  });
}

// ========== GDPR Audit Logs ==========

export type GdprAuditLog = AllGdprAuditLogs[number];

// Default query params for fetching GDPR audit logs
const GDPR_AUDIT_LOGS_QUERY_PARAMS = { limit: 100, offset: 0 } as const;

// Read-only collection for viewing GDPR audit logs as admin
export const GdprAuditLogsCollection = createCollection(
  queryCollectionOptions<GdprAuditLog>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.audit.getGdprAuditLogs.queryKey(
      GDPR_AUDIT_LOGS_QUERY_PARAMS,
    ),
    queryFn: () =>
      trpcClient.audit.getGdprAuditLogs.query(GDPR_AUDIT_LOGS_QUERY_PARAMS),
  }),
);

export function useGdprAuditLogs() {
  return useLiveQuery(GdprAuditLogsCollection);
}

// ========== Message Reactions ==========

// Re-export Reaction type from server for frontend use
export type { Reaction, ReactionUpdate } from "@apps/server/src/routers/chat";

/**
 * Toggle a reaction on a message.
 * The reaction update is published via SSE to all subscribers.
 */
export async function toggleMessageReaction({
  messageId,
  emoji,
  channelId,
}: {
  messageId: string;
  emoji: string;
  channelId: string;
}) {
  try {
    // Call the server to toggle the reaction
    // Server will publish update to SSE stream for all subscribers
    const updatedReactions = await trpcClient.chat.toggleReaction.mutate({
      messageId,
      emoji,
      channelId,
    });

    return updatedReactions;
  } catch (error) {
    console.error("Error toggling reaction:", error);
    toast.error("Failed to update reaction. Please try again.");
    throw error;
  }
}

// ========== SSE Sync Infrastructure ==========

/**
 * Sync state for tracking offline updates and reconnection
 */
export interface SyncState {
  lastSyncTimestamp: number;
  isConnected: boolean;
  pendingUpdates: number;
  isSyncing: boolean;
}

/**
 * Entity sync update from the server.
 * This matches the server-side EntitySyncUpdate type.
 */
export interface EntitySyncUpdate<T> {
  id: string;
  type: "created" | "updated" | "deleted";
  data: T | null;
  entityId: string;
  timestamp: number;
  actorId?: string;
}

// Storage key for tracking last sync timestamps per collection
const SYNC_STORAGE_KEY_PREFIX = "sync:lastTimestamp:";

/**
 * Get the last sync timestamp for a collection from localStorage.
 */
export function getLastSyncTimestamp(collectionName: string): number {
  const stored = localStorage.getItem(
    `${SYNC_STORAGE_KEY_PREFIX}${collectionName}`,
  );
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * Save the last sync timestamp for a collection to localStorage.
 */
export function setLastSyncTimestamp(
  collectionName: string,
  timestamp: number,
): void {
  localStorage.setItem(
    `${SYNC_STORAGE_KEY_PREFIX}${collectionName}`,
    timestamp.toString(),
  );
}

/**
 * Apply a sync update to a collection.
 * Handles created, updated, and deleted entity types.
 *
 * Note: This function is currently not used as we're using query invalidation
 * instead of direct collection updates for SSE sync. Kept for future use
 * if direct collection updates are needed.
 */
export function applySyncUpdate<T extends { id: string }>(
  collection: ReturnType<typeof createCollection<T>>,
  update: EntitySyncUpdate<T>,
): void {
  // Currently using query invalidation instead of direct collection updates
  // See useSseSync.ts hooks for the implementation
  console.debug(
    "applySyncUpdate called - using query invalidation instead",
    collection,
    update,
  );
}

/**
 * Sync pending updates for a collection that was offline.
 * Fetches all updates since the last sync timestamp and applies them.
 *
 * Note: This function is currently not used as we're using query invalidation
 * instead of direct collection updates for SSE sync. The useSseSync.ts hooks
 * handle offline sync by fetching updates and invalidating queries.
 */
export async function syncOfflineUpdates<T extends { id: string }>(
  collectionName: string,
  _collection: ReturnType<typeof createCollection<T>>,
  fetchUpdatesSince: (since: number) => Promise<EntitySyncUpdate<T>[]>,
): Promise<number> {
  const lastSync = getLastSyncTimestamp(collectionName);

  if (lastSync === 0) {
    // First sync - no history to fetch
    setLastSyncTimestamp(collectionName, Date.now());
    return 0;
  }

  try {
    const updates = await fetchUpdatesSince(lastSync);

    // Update last sync timestamp
    const latestTimestamp =
      updates.length > 0
        ? Math.max(...updates.map((u) => u.timestamp))
        : Date.now();
    setLastSyncTimestamp(collectionName, latestTimestamp);

    return updates.length;
  } catch (error) {
    console.error(`Error syncing ${collectionName} updates:`, error);
    throw error;
  }
}

// Export sync utilities for use in route loaders and components
export const syncUtils = {
  getLastSyncTimestamp,
  setLastSyncTimestamp,
  applySyncUpdate,
  syncOfflineUpdates,
};
