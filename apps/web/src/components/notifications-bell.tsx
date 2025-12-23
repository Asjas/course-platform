import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Info,
  type LucideIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  type Announcement,
  markAnnouncementAsRead,
  useReadAnnouncements,
  useUnreadAnnouncements,
} from "~/lib/db.collections";

interface NotificationsBellProps {
  userId: string;
}

type AnnouncementType = Announcement["type"];

const announcementIcons: Record<AnnouncementType, LucideIcon> = {
  platform_update: Info,
  platform_warning: AlertCircle,
  course_update: Info,
  new_course: Bell,
  general: Info,
  warning: AlertCircle,
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

const announcementIconColors: Record<AnnouncementType, string> = {
  platform_update: "text-blue-600 dark:text-blue-400",
  platform_warning: "text-red-600 dark:text-red-400",
  course_update: "text-green-600 dark:text-green-400",
  new_course: "text-purple-600 dark:text-purple-400",
  general: "text-gray-600 dark:text-gray-400",
  warning: "text-yellow-600 dark:text-yellow-400",
};

export function NotificationsBell({ userId }: NotificationsBellProps) {
  const [activeTab, setActiveTab] = useState<"new" | "read">("new");
  const { data: unreadData } = useUnreadAnnouncements({ userId });
  const { data: readData } = useReadAnnouncements({ userId });

  const unreadCount = unreadData?.length || 0;
  const unreadAnnouncements = unreadData || [];
  const readAnnouncements = readData || [];

  async function handleDismiss(announcementId: string) {
    await markAnnouncementAsRead({ announcementId, userId });
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

      <PopoverPanel className="absolute right-0 z-50 mt-2 w-96 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg max-md:fixed max-md:inset-x-0 max-md:top-14 max-md:w-full max-md:rounded-none max-md:border-x-0 md:max-w-md dark:border-gray-700 dark:bg-gray-800">
        {({ close }) => (
          <div className="p-4 max-md:min-h-[calc(100vh-3.5rem)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <button
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeTab === "new"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setActiveTab("new")}
                  >
                    New {unreadCount > 0 && `(${unreadCount})`}
                  </button>
                  <button
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
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

            <div className="custom-scrollbar max-h-96 space-y-3 overflow-y-auto">
              {activeTab === "new" ? (
                unreadAnnouncements.length > 0 ? (
                  unreadAnnouncements.map((announcement: Announcement) => {
                    const Icon = announcementIcons[announcement.type] || Info;
                    const colorClass =
                      announcementColors[announcement.type] ||
                      announcementColors.general;
                    const iconColorClass =
                      announcementIconColors[announcement.type] ||
                      announcementIconColors.general;
                    return (
                      <div
                        className={`rounded-lg border p-3 ${colorClass}`}
                        key={announcement.id}
                      >
                        <div className="flex items-start gap-2">
                          <Icon
                            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${iconColorClass}`}
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {announcement.title}
                            </h4>
                            <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                              {announcement.message}
                            </p>
                            {announcement.publishedAt && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {new Date(
                                  announcement.publishedAt,
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <button
                            className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            onClick={() => handleDismiss(announcement.id)}
                            aria-label="Dismiss notification"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    No new notifications
                  </p>
                )
              ) : readAnnouncements.length > 0 ? (
                readAnnouncements.map((announcement: Announcement) => {
                  const Icon = announcementIcons[announcement.type] || Info;
                  return (
                    <div
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3 opacity-60 dark:border-gray-700 dark:bg-gray-900/50"
                      key={announcement.id}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {announcement.title}
                          </h4>
                          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                            {announcement.message}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <CheckCircle className="h-3 w-3" />
                            <span>
                              Dismissed{" "}
                              {announcement.readAt
                                ? new Date(
                                    announcement.readAt,
                                  ).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
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
