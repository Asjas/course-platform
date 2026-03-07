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
  markAnnouncementAsRead,
  useReadAnnouncements,
  useUnreadAnnouncements,
} from "~/lib/db.collections";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  publishedAt: Date | string | null;
  readAt?: Date | string | null;
}

interface AnnouncementsBannerProps {
  userId: string;
}

type AnnouncementType =
  | "platform_update"
  | "platform_warning"
  | "course_update"
  | "new_course"
  | "general"
  | "warning";

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

export function AnnouncementsBanner({ userId }: AnnouncementsBannerProps) {
  const [activeTab, setActiveTab] = useState<"active" | "dismissed">("active");

  const { data: unreadAnnouncements } = useUnreadAnnouncements({ userId });

  const { data: readAnnouncements } = useReadAnnouncements({ userId });

  async function handleDismiss(announcementId: string) {
    await markAnnouncementAsRead({ announcementId, userId });
  }

  const activeAnnouncements = unreadAnnouncements || [];
  const dismissedAnnouncements = readAnnouncements || [];

  if (activeTab === "active" && activeAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Announcements
        </h2>
        <div className="flex gap-2">
          <button
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              activeTab === "active"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active{" "}
            {activeAnnouncements.length > 0 &&
              `(${activeAnnouncements.length})`}
          </button>
          <button
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              activeTab === "dismissed"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setActiveTab("dismissed")}
          >
            Dismissed
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {activeTab === "active" ? (
          activeAnnouncements.length > 0 ? (
            activeAnnouncements.map((announcement: Announcement) => {
              const Icon = announcementIcons[announcement.type] || Info;
              return (
                <div
                  className={`rounded-lg border p-4 ${
                    announcementColors[announcement.type]
                  }`}
                  key={announcement.id}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        announcementIconColors[announcement.type]
                      }`}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {announcement.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {announcement.message}
                      </p>
                      {announcement.publishedAt && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(
                            announcement.publishedAt,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      onClick={() => handleDismiss(announcement.id)}
                      aria-label="Dismiss announcement"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No active announcements
            </p>
          )
        ) : dismissedAnnouncements.length > 0 ? (
          dismissedAnnouncements.map((announcement: Announcement) => {
            const Icon = announcementIcons[announcement.type] || Info;
            return (
              <div
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-60 dark:border-gray-700 dark:bg-gray-900/50"
                key={announcement.id}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {announcement.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {announcement.message}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <CheckCircle className="h-3 w-3" />
                      <span>
                        Dismissed on{" "}
                        {announcement.readAt
                          ? new Date(announcement.readAt).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No dismissed announcements
          </p>
        )}
      </div>
    </div>
  );
}
