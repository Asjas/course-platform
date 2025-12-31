import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Bell,
  CheckCircle,
  CircleDollarSign,
  CreditCard,
  Flag,
  Info,
  type LucideIcon,
  Mail,
  MessageSquare,
  RefreshCw,
  Star,
  Tag,
  Ticket,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  type Announcement,
  type UserNotification,
  markAnnouncementAsRead,
  markUserNotificationAsRead,
  useReadAnnouncements,
  useReadUserNotifications,
  useUnreadAnnouncements,
  useUnreadUserNotifications,
} from "~/lib/db.collections";

interface NotificationsBellProps {
  userId: string;
}

type AnnouncementType = Announcement["type"];
type NotificationType = UserNotification["type"];

const announcementIcons: Record<AnnouncementType, LucideIcon> = {
  platform_update: Info,
  platform_warning: AlertCircle,
  course_update: Info,
  new_course: Bell,
  general: Info,
  warning: AlertCircle,
};

const userNotificationIcons: Record<NotificationType, LucideIcon> = {
  // Existing types
  support_ticket_comment: MessageSquare,
  support_ticket_status_change: AlertCircle,
  course_enrollment: Bell,
  review_approved: Star,
  general: Info,
  // Payment-related notifications
  payment_completed: CheckCircle,
  payment_refunded: RefreshCw,
  payment_failed: XCircle,
  // Coupon-related notifications
  coupon_redeemed: Tag,
  coupon_expired: AlertTriangle,
  // Team license notifications
  team_license_purchased: Users,
  team_license_invite_received: Mail,
  team_license_invite_accepted: UserCheck,
  team_license_invite_revoked: XCircle,
  team_license_seat_claimed: UserPlus,
  // Course-related notifications
  course_published: Bell,
  certificate_issued: Award,
  // Support ticket updates
  support_ticket_assigned: Ticket,
  support_ticket_resolved: CheckCircle,
  // Admin notifications
  admin_new_review: Star,
  admin_new_support_ticket: MessageSquare,
  admin_support_ticket_comment: MessageSquare,
  admin_new_purchase: CreditCard,
  admin_refund_requested: CircleDollarSign,
  admin_coupon_usage_threshold: Tag,
  admin_team_license_created: Users,
  admin_course_review_milestone: TrendingUp,
  admin_enrollment_milestone: TrendingUp,
  admin_new_user_registration: UserPlus,
  admin_chat_message_reported: Flag,
  // DM notifications
  dm_request_received: Mail,
  dm_request_approved: CheckCircle,
  dm_request_denied: XCircle,
};

const announcementColors: Record<AnnouncementType, string> = {
  platform_update:
    "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  platform_warning:
    "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  course_update:
    "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  new_course:
    "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
  general:
    "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700",
  warning:
    "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
};

const userNotificationColors: Record<NotificationType, string> = {
  // Existing types
  support_ticket_comment:
    "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
  support_ticket_status_change:
    "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  course_enrollment:
    "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  review_approved:
    "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
  general:
    "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700",
  // Payment-related notifications
  payment_completed:
    "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  payment_refunded:
    "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
  payment_failed:
    "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  // Coupon-related notifications
  coupon_redeemed:
    "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
  coupon_expired:
    "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
  // Team license notifications
  team_license_purchased:
    "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800",
  team_license_invite_received:
    "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  team_license_invite_accepted:
    "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  team_license_invite_revoked:
    "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  team_license_seat_claimed:
    "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800",
  // Course-related notifications
  course_published:
    "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
  certificate_issued:
    "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
  // Support ticket updates
  support_ticket_assigned:
    "bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800",
  support_ticket_resolved:
    "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  // Admin notifications
  admin_new_review:
    "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
  admin_new_support_ticket:
    "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
  admin_support_ticket_comment:
    "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
  admin_new_purchase:
    "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  admin_refund_requested:
    "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  admin_coupon_usage_threshold:
    "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
  admin_team_license_created:
    "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800",
  admin_course_review_milestone:
    "bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800",
  admin_enrollment_milestone:
    "bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800",
  admin_new_user_registration:
    "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  admin_chat_message_reported:
    "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  // DM notifications
  dm_request_received:
    "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  dm_request_approved:
    "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  dm_request_denied:
    "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
};

const announcementIconColors: Record<AnnouncementType, string> = {
  platform_update: "text-blue-600 dark:text-blue-400",
  platform_warning: "text-red-600 dark:text-red-400",
  course_update: "text-green-600 dark:text-green-400",
  new_course: "text-purple-600 dark:text-purple-400",
  general: "text-gray-600 dark:text-gray-400",
  warning: "text-yellow-600 dark:text-yellow-400",
};

const userNotificationIconColors: Record<NotificationType, string> = {
  // Existing types
  support_ticket_comment: "text-orange-600 dark:text-orange-400",
  support_ticket_status_change: "text-blue-600 dark:text-blue-400",
  course_enrollment: "text-green-600 dark:text-green-400",
  review_approved: "text-yellow-600 dark:text-yellow-400",
  general: "text-gray-600 dark:text-gray-400",
  // Payment-related notifications
  payment_completed: "text-green-600 dark:text-green-400",
  payment_refunded: "text-yellow-600 dark:text-yellow-400",
  payment_failed: "text-red-600 dark:text-red-400",
  // Coupon-related notifications
  coupon_redeemed: "text-purple-600 dark:text-purple-400",
  coupon_expired: "text-orange-600 dark:text-orange-400",
  // Team license notifications
  team_license_purchased: "text-indigo-600 dark:text-indigo-400",
  team_license_invite_received: "text-blue-600 dark:text-blue-400",
  team_license_invite_accepted: "text-green-600 dark:text-green-400",
  team_license_invite_revoked: "text-red-600 dark:text-red-400",
  team_license_seat_claimed: "text-teal-600 dark:text-teal-400",
  // Course-related notifications
  course_published: "text-purple-600 dark:text-purple-400",
  certificate_issued: "text-amber-600 dark:text-amber-400",
  // Support ticket updates
  support_ticket_assigned: "text-cyan-600 dark:text-cyan-400",
  support_ticket_resolved: "text-green-600 dark:text-green-400",
  // Admin notifications
  admin_new_review: "text-yellow-600 dark:text-yellow-400",
  admin_new_support_ticket: "text-orange-600 dark:text-orange-400",
  admin_support_ticket_comment: "text-orange-600 dark:text-orange-400",
  admin_new_purchase: "text-green-600 dark:text-green-400",
  admin_refund_requested: "text-red-600 dark:text-red-400",
  admin_coupon_usage_threshold: "text-purple-600 dark:text-purple-400",
  admin_team_license_created: "text-indigo-600 dark:text-indigo-400",
  admin_course_review_milestone: "text-pink-600 dark:text-pink-400",
  admin_enrollment_milestone: "text-pink-600 dark:text-pink-400",
  admin_new_user_registration: "text-blue-600 dark:text-blue-400",
  admin_chat_message_reported: "text-red-600 dark:text-red-400",
  // DM notifications
  dm_request_received: "text-blue-600 dark:text-blue-400",
  dm_request_approved: "text-green-600 dark:text-green-400",
  dm_request_denied: "text-red-600 dark:text-red-400",
};

// Combined notification item type for rendering
interface CombinedNotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  type: "announcement" | "user_notification";
  subType: AnnouncementType | NotificationType;
  link?: string | null;
  readAt?: Date | string | null;
}

export function NotificationsBell({ userId }: NotificationsBellProps) {
  const [activeTab, setActiveTab] = useState<"new" | "read">("new");

  // Announcements
  const { data: unreadAnnouncementsData } = useUnreadAnnouncements({ userId });
  const { data: readAnnouncementsData } = useReadAnnouncements({ userId });

  // User notifications
  const { data: unreadUserNotificationsData } = useUnreadUserNotifications({
    userId,
  });
  const { data: readUserNotificationsData } = useReadUserNotifications({
    userId,
  });

  // Combine and sort unread notifications
  const unreadAnnouncements: CombinedNotificationItem[] = (
    unreadAnnouncementsData || []
  ).map((a) => ({
    id: a.id,
    title: a.title,
    message: a.message,
    createdAt: new Date(a.publishedAt || a.createdAt),
    type: "announcement" as const,
    subType: a.type,
    link: null,
  }));

  const unreadUserNotifications: CombinedNotificationItem[] = (
    unreadUserNotificationsData || []
  ).map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt: new Date(n.createdAt),
    type: "user_notification" as const,
    subType: n.type,
    link: n.link,
  }));

  const allUnread = [...unreadAnnouncements, ...unreadUserNotifications].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  // Combine and sort read notifications
  const readAnnouncements: CombinedNotificationItem[] = (
    readAnnouncementsData || []
  ).map((a) => ({
    id: a.id,
    title: a.title,
    message: a.message,
    createdAt: new Date(a.publishedAt || a.createdAt),
    type: "announcement" as const,
    subType: a.type,
    link: null,
    readAt: a.readAt,
  }));

  const readUserNotifications: CombinedNotificationItem[] = (
    readUserNotificationsData || []
  ).map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt: new Date(n.createdAt),
    type: "user_notification" as const,
    subType: n.type,
    link: n.link,
    readAt: n.readAt,
  }));

  const allRead = [...readAnnouncements, ...readUserNotifications].sort(
    (a, b) => {
      const aReadAt = a.readAt ? new Date(a.readAt).getTime() : 0;
      const bReadAt = b.readAt ? new Date(b.readAt).getTime() : 0;
      return bReadAt - aReadAt;
    },
  );

  const unreadCount = allUnread.length;

  async function handleDismiss(item: CombinedNotificationItem) {
    if (item.type === "announcement") {
      await markAnnouncementAsRead({ announcementId: item.id, userId });
    } else {
      await markUserNotificationAsRead({ notificationId: item.id, userId });
    }
  }

  function getIcon(item: CombinedNotificationItem): LucideIcon {
    if (item.type === "announcement") {
      return announcementIcons[item.subType as AnnouncementType] || Info;
    }
    return userNotificationIcons[item.subType as NotificationType] || Info;
  }

  function getColorClass(item: CombinedNotificationItem): string {
    if (item.type === "announcement") {
      return (
        announcementColors[item.subType as AnnouncementType] ||
        announcementColors.general
      );
    }
    return (
      userNotificationColors[item.subType as NotificationType] ||
      userNotificationColors.general
    );
  }

  function getIconColorClass(item: CombinedNotificationItem): string {
    if (item.type === "announcement") {
      return (
        announcementIconColors[item.subType as AnnouncementType] ||
        announcementIconColors.general
      );
    }
    return (
      userNotificationIconColors[item.subType as NotificationType] ||
      userNotificationIconColors.general
    );
  }

  return (
    <Popover className="relative">
      <PopoverButton className="relative inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-green-600 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300">
        <Bell
          className="h-6 w-6"
          aria-hidden="true"
        />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600" />
        )}
        <span className="sr-only">Notifications</span>
      </PopoverButton>

      <PopoverPanel className="absolute right-0 z-50 mt-6 w-96 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg max-md:fixed max-md:inset-x-0 max-md:top-14 max-md:w-full max-md:rounded-none max-md:border-x-0 md:max-w-md dark:border-gray-700 dark:bg-gray-800">
        {({ close }) => (
          <div className="p-4 max-md:min-h-[calc(100vh-3.5rem)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeTab === "new"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setActiveTab("new")}
                  >
                    New {unreadCount > 0 && `(${unreadCount})`}
                  </button>
                  <button
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeTab === "read"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setActiveTab("read")}
                  >
                    Read
                  </button>
                </div>
                <button
                  className="cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  onClick={() => close()}
                  aria-label="Close notifications"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="custom-scrollbar max-h-100 space-y-3 overflow-y-auto">
              {activeTab === "new" ? (
                allUnread.length > 0 ? (
                  allUnread.map((item) => {
                    const Icon = getIcon(item);
                    const colorClass = getColorClass(item);
                    const iconColorClass = getIconColorClass(item);

                    const content = (
                      <div className="flex items-start gap-2">
                        <Icon
                          className={`mt-0.5 h-4 w-4 shrink-0 ${iconColorClass}`}
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                            {item.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {item.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          className="shrink-0 cursor-pointer rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDismiss(item);
                          }}
                          aria-label="Dismiss notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );

                    // If the notification has a link, wrap it in a Link component
                    if (item.link) {
                      return (
                        <Link
                          className={`block rounded-lg border p-3 transition-colors hover:opacity-80 ${colorClass}`}
                          key={item.id}
                          to={item.link}
                          onClick={() => close()}
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <div
                        className={`rounded-lg border p-3 ${colorClass}`}
                        key={item.id}
                      >
                        {content}
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    No new notifications
                  </p>
                )
              ) : allRead.length > 0 ? (
                allRead.map((item) => {
                  const Icon = getIcon(item);

                  const content = (
                    <div className="flex items-start gap-2">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                          {item.message}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>
                            Dismissed{" "}
                            {item.readAt
                              ? new Date(item.readAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );

                  // If the notification has a link, wrap it in a Link component
                  if (item.link) {
                    return (
                      <Link
                        className="block rounded-lg border border-gray-200 bg-gray-50 p-3 opacity-60 transition-colors hover:opacity-80 dark:border-gray-700 dark:bg-gray-900/50"
                        key={item.id}
                        to={item.link}
                        onClick={() => close()}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3 opacity-60 dark:border-gray-700 dark:bg-gray-900/50"
                      key={item.id}
                    >
                      {content}
                    </div>
                  );
                })
              ) : (
                <p className="py-8 text-center text-sm text-gray-600 dark:text-gray-400">
                  No read notifications
                </p>
              )}
            </div>
          </div>
        )}
      </PopoverPanel>
    </Popover>
  );
}
