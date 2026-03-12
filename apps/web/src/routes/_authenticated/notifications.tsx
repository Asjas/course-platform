import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "~/lib/auth.context";
import {
  type NotificationPreference,
  saveNotificationPreferences,
  useNotificationPreferences,
} from "~/lib/db.collections";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationPreferencesPage,
});

// ─── Notification preference keys (mirrors server NOTIFICATION_PREFERENCE_KEYS) ──

const NOTIFICATION_PREFERENCE_KEYS = [
  "browser:support:ticket_comment",
  "email:support:ticket_comment",
  "browser:support:ticket_closed",
  "email:support:ticket_closed",
  "browser:chat:tagged_message",
  "email:chat:tagged_message",
  "browser:chat:dm_message",
  "email:chat:dm_message",
  "browser:course:course_update",
  "email:course:course_update",
  "browser:course:lesson_update",
  "email:course:lesson_update",
] as const;

type NotificationPreferenceKey = (typeof NOTIFICATION_PREFERENCE_KEYS)[number];

// ─── Label maps ──────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  support: "Support Tickets",
  chat: "Chat Messages",
  course: "Courses",
};

const TYPE_LABELS: Record<string, string> = {
  ticket_comment: "New comment on your ticket",
  ticket_closed: "Ticket closed or resolved",
  tagged_message: "Mentioned in a chat channel (@username)",
  dm_message: "New direct message",
  course_update: "Course content updated",
  lesson_update: "Lesson updated",
};

const CHANNEL_LABELS: Record<string, string> = {
  browser: "Browser notification",
  email: "Email notification",
};

// ─── Group preferences by category ──────────────────────────────────────────

type GroupedPrefs = Record<
  string,
  Record<
    string,
    {
      browser: NotificationPreferenceKey;
      email: NotificationPreferenceKey;
    }
  >
>;

function groupKeys(): GroupedPrefs {
  const result: GroupedPrefs = {};
  for (const key of NOTIFICATION_PREFERENCE_KEYS) {
    const parts = key.split(":") as [string, string, string];
    const category = parts[1];
    const type = parts[2];
    if (!result[category]) result[category] = {};
    if (!result[category][type]) {
      result[category][type] = {
        browser: `browser:${category}:${type}` as NotificationPreferenceKey,
        email: `email:${category}:${type}` as NotificationPreferenceKey,
      };
    }
  }
  return result;
}

// ─── Page Component ───────────────────────────────────────────────────────────

function NotificationPreferencesPage() {
  const auth = useAuth();
  const userId = auth.session?.user?.id ?? "";

  const { data: savedPrefs, isLoading } = useNotificationPreferences({
    userId,
  });

  // Local state for the form (defaults to false; synced from server once loaded)
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const key of NOTIFICATION_PREFERENCE_KEYS) {
      initial[key] = false;
    }
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when server data loads
  useEffect(() => {
    if (!isLoading && Array.isArray(savedPrefs) && savedPrefs.length > 0) {
      const savedMap = Object.fromEntries(
        (savedPrefs as NotificationPreference[]).map((p) => [p.key, p.enabled]),
      );
      const updated: Record<string, boolean> = {};
      for (const key of NOTIFICATION_PREFERENCE_KEYS) {
        updated[key] = savedMap[key] ?? false;
      }
      setPrefs(updated);
    }
  }, [isLoading, savedPrefs]);

  function handleToggle(key: NotificationPreferenceKey) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveNotificationPreferences({
        userId,
        preferences: Object.entries(prefs).map(([key, enabled]) => ({
          key,
          enabled,
        })),
      });
    } catch {
      // error already shown by saveNotificationPreferences
    } finally {
      setIsSaving(false);
    }
  }

  const grouped = groupKeys();

  return (
    <div className="mx-auto mt-20 mb-20 max-w-3xl px-4 md:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl/9 font-semibold text-gray-900 dark:text-white">
          Notification Preferences
        </h1>
        <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
          Choose how you want to be notified. Browser notifications appear in
          the app; email notifications are sent to your registered address.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading preferences…
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, types]) => (
              <section
                className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
                key={category}
                aria-labelledby={`section-${category}`}
              >
                <h2
                  className="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
                  id={`section-${category}`}
                >
                  {SECTION_LABELS[category] ?? category}
                </h2>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {Object.entries(types).map(([type, keys]) => (
                    <div
                      className="py-4 first:pt-0 last:pb-0"
                      key={type}
                    >
                      <p className="mb-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {TYPE_LABELS[type] ?? type}
                      </p>

                      <div className="flex flex-wrap gap-6">
                        {(["browser", "email"] as ("browser" | "email")[]).map(
                          (channel) => {
                            const key = keys[channel];
                            const isEnabled = prefs[key] ?? false;

                            return (
                              <label
                                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                                key={channel}
                              >
                                <input
                                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800"
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={() => handleToggle(key)}
                                  aria-label={`${CHANNEL_LABELS[channel]} for "${TYPE_LABELS[type] ?? type}"`}
                                />
                                {CHANNEL_LABELS[channel]}
                              </label>
                            );
                          },
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={isSaving}
              aria-disabled={isSaving}
              data-loading={isSaving ? "true" : "false"}
            >
              {isSaving ? "Saving…" : "Save preferences"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
