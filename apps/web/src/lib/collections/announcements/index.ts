/**
 * Announcements Collection
 *
 * Re-exports collection and hooks for platform announcements.
 */

export {
  AnnouncementsCollection,
  markAnnouncementAsRead,
  type Announcement,
} from "./announcements.collection";

export {
  useAnnouncements,
  useUnreadAnnouncements,
  useReadAnnouncements,
} from "./hooks";
