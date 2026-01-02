/**
 * Collections
 *
 * Central export point for all offline-first collections.
 * Import from "~/lib/collections" instead of "~/lib/db.collections".
 *
 * CRITICAL: All data fetching MUST go through these collections.
 * Never use tRPC or React Query directly in components.
 *
 * @example
 * // ❌ NEVER: Direct tRPC/React Query in components
 * const { data } = trpc.courses.getAll.useQuery();
 *
 * // ✅ ALWAYS: Use collection hooks
 * import { useCourses } from "~/lib/collections";
 * const { data } = useCourses();
 */

// ========== Types ==========
export type { SyncState, EntitySyncUpdate } from "./types";

// ========== Utilities ==========
export {
  getLastSyncTimestamp,
  setLastSyncTimestamp,
  applySyncUpdate,
  syncOfflineUpdates,
  syncUtils,
} from "./utils";

// ========== Support Tickets ==========
export {
  SupportTicketsCollection,
  useSupportTickets,
  useSupportTicketsByCourseId,
  useSupportTicketById,
  type SupportTicket,
} from "./support-tickets";

// ========== Coupons ==========
export {
  CouponsCollection,
  useCoupons,
  useCouponById,
  type Coupon,
} from "./coupons";

// ========== Announcements ==========
export {
  AnnouncementsCollection,
  useAnnouncements,
  useUnreadAnnouncements,
  useReadAnnouncements,
  markAnnouncementAsRead,
  type Announcement,
} from "./announcements";

// ========== Courses ==========
export {
  CoursesCollection,
  CoursesAdminCollection,
  CourseProgressCollection,
  LessonProgressCollection,
  useCourses,
  useCoursesAdmin,
  useCourseById,
  type CourseWithModulesAndLessons,
  type AdminCourseDetail,
} from "./courses";

// ========== Reviews ==========
export {
  ReviewsCollection,
  useReviews,
  useReviewById,
  type Review,
} from "./reviews";

// ========== Chat Reports ==========
export {
  ChatReportsCollection,
  useChatReports,
  useChatReportById,
  type ChatReport,
} from "./chat-reports";

// ========== Searchable Users ==========
export {
  SearchableUsersCollection,
  useSearchableUsers,
  type SearchableUser,
} from "./searchable-users";

// ========== Sync Status ==========
export {
  SyncStatusCollection,
  useSyncStatuses,
  useSyncStatusByCollection,
  type SyncStatusItem,
} from "./sync-status";

// ========== GDPR Audit Logs ==========
export {
  GdprAuditLogsCollection,
  useGdprAuditLogs,
  type GdprAuditLog,
} from "./gdpr-audit-logs";

// ========== Chat Messages ==========
export {
  createChannelMessagesCollection,
  createDMMessagesCollection,
  toggleMessageReaction,
  type ChannelMessage,
  type DMMessage,
  type ChatMessage,
  type Reaction,
  type ReactionUpdate,
} from "./chat-messages";

// ========== User Notifications ==========
export {
  useUnreadUserNotifications,
  useReadUserNotifications,
  markUserNotificationAsRead,
  type UserNotification,
} from "./notifications";
