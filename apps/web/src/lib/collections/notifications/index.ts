/**
 * User Notifications
 *
 * Re-exports hooks and utilities for user notifications.
 * Note: Notifications are user-scoped, so we use React Query
 * instead of a shared collection.
 */

export {
  useUnreadUserNotifications,
  useReadUserNotifications,
  markUserNotificationAsRead,
  type UserNotification,
} from "./hooks";
