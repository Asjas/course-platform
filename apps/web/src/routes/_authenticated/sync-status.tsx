import { Badge } from "@packages/shared-ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/shared-ui/components/tabs";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Cloud,
  CloudAlert,
  CloudOff,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CollectionSyncStatus } from "~/components/sync-status-indicator";
import {
  useAnnouncementsSync,
  useChatReportsSync,
  useCouponsSync,
  useCoursesSync,
  useNotificationsSync,
  useReviewsSync,
  useSupportTicketsSync,
} from "~/hooks/useSseSync";
import { useAuth } from "~/lib/auth.context";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authenticated/sync-status")({
  component: SyncStatusPage,
});

/**
 * Format a timestamp to a human-readable relative time
 */
function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return "Never";

  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 1000) return "Just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

/**
 * Get the icon for the sync status
 */
function StatusIcon({
  status,
  className,
}: {
  status: "connected" | "syncing" | "disconnected" | "error";
  className?: string;
}) {
  switch (status) {
    case "connected":
      return <Cloud className={cn("text-green-500", className)} />;
    case "syncing":
      return (
        <RefreshCw className={cn("animate-spin text-blue-500", className)} />
      );
    case "disconnected":
      return <CloudOff className={cn("text-muted-foreground", className)} />;
    case "error":
      return <CloudAlert className={cn("text-destructive", className)} />;
  }
}

/**
 * Individual collection status card
 */
function CollectionStatusCard({ status }: { status: CollectionSyncStatus }) {
  const cardStatus = status.error
    ? "error"
    : status.isSyncing
      ? "syncing"
      : status.isConnected
        ? "connected"
        : "disconnected";

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon
            className="h-6 w-6"
            status={cardStatus}
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {status.displayName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {status.error
                ? "Error syncing"
                : status.isSyncing
                  ? "Syncing..."
                  : status.isConnected
                    ? "Connected"
                    : "Disconnected"}
            </p>
          </div>
        </div>
        <div className="text-right">
          {status.isConnected ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : status.isSyncing ? (
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          ) : status.error ? (
            <CloudAlert className="text-destructive h-5 w-5" />
          ) : (
            <CloudOff className="text-muted-foreground h-5 w-5" />
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Last synced:</span>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatRelativeTime(status.lastSyncedAt)}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            Pending updates:
          </span>
          <p className="font-medium text-gray-900 dark:text-white">
            {status.pendingUpdates}
          </p>
        </div>
      </div>

      {status.error && (
        <div className="mt-3 rounded-md bg-red-50 p-2 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            {status.error.message}
          </p>
        </div>
      )}
    </div>
  );
}

function SyncStatusPage() {
  const auth = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Subscribe to all collections
  const supportTicketsStatus = useSupportTicketsSync();
  const couponsStatus = useCouponsSync();
  const reviewsStatus = useReviewsSync();
  const announcementsStatus = useAnnouncementsSync();
  const coursesStatus = useCoursesSync();
  const chatReportsStatus = useChatReportsSync();
  const notificationsStatus = useNotificationsSync(
    auth.session?.user?.id ?? "",
  );

  // Track online/offline status
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Build collection status array
  const collections: CollectionSyncStatus[] = [
    {
      name: "support-tickets",
      displayName: "Support Tickets",
      ...supportTicketsStatus,
    },
    {
      name: "coupons",
      displayName: "Coupons",
      ...couponsStatus,
    },
    {
      name: "reviews",
      displayName: "Reviews",
      ...reviewsStatus,
    },
    {
      name: "announcements",
      displayName: "Announcements",
      ...announcementsStatus,
    },
    {
      name: "courses",
      displayName: "Courses",
      ...coursesStatus,
    },
    {
      name: "chat-reports",
      displayName: "Chat Reports",
      ...chatReportsStatus,
    },
    {
      name: "notifications",
      displayName: "Notifications",
      ...notificationsStatus,
    },
  ];

  const connectedCount = collections.filter((c) => c.isConnected).length;
  const connectedCollections = collections.filter((c) => c.isConnected);
  const disconnectedCollections = collections.filter((c) => !c.isConnected);
  const hasErrors = collections.some((c) => c.error);

  return (
    <div className="mx-auto mt-20 mb-20 w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl/9 font-semibold text-gray-900 dark:text-white">
          Sync Status
        </h1>
        <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
          Monitor real-time data synchronization across all collections.
        </p>
      </div>

      {/* Overview Card */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                isOnline
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-gray-100 dark:bg-gray-700",
              )}
            >
              {isOnline ? (
                <Wifi className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isOnline ? "Online" : "Offline"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isOnline
                  ? "Real-time sync is active"
                  : "Working with cached data"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              className="text-sm"
              variant={
                hasErrors
                  ? "destructive"
                  : connectedCount === collections.length
                    ? "default"
                    : "secondary"
              }
            >
              {connectedCount}/{collections.length} connected
            </Badge>
          </div>
        </div>
      </div>

      {/* Collection Status Tabs */}
      <Tabs
        className="w-full"
        defaultValue="all"
      >
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({collections.length})</TabsTrigger>
          <TabsTrigger value="connected">
            Connected ({connectedCollections.length})
          </TabsTrigger>
          <TabsTrigger value="disconnected">
            Offline ({disconnectedCollections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((status) => (
              <CollectionStatusCard
                key={status.name}
                status={status}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connected">
          {connectedCollections.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900">
              <CloudOff className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No collections connected
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Check your internet connection and try refreshing the page.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectedCollections.map((status) => (
                <CollectionStatusCard
                  key={status.name}
                  status={status}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="disconnected">
          {disconnectedCollections.length === 0 ? (
            <div className="rounded-lg bg-green-50 p-8 text-center dark:bg-green-900/20">
              <Cloud className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                All collections connected
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Real-time sync is active for all data.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {disconnectedCollections.map((status) => (
                <CollectionStatusCard
                  key={status.name}
                  status={status}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <div className="mt-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
        <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
          About Offline-First Sync
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          This application uses an offline-first architecture. Your data is
          cached locally and synced with the server in real-time when online.
          When you&apos;re offline, you can continue working with cached data,
          and changes will sync automatically when your connection is restored.
        </p>
      </div>
    </div>
  );
}
