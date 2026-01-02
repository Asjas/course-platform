/**
 * SyncStatusIndicator Component
 *
 * Displays the current sync status for real-time SSE connections.
 * Shows connection state, pending updates, and last sync time.
 * Similar design to the notification bell UI.
 */
import { Badge } from "@packages/shared-ui/components/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/shared-ui/components/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/shared-ui/components/tabs";
import {
  Check,
  ChevronDown,
  Cloud,
  CloudAlert,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import type { SyncStatus } from "~/hooks/useSseSync";
import { cn } from "~/lib/utils";

/**
 * Collection sync status with name
 */
export interface CollectionSyncStatus extends SyncStatus {
  name: string;
  displayName: string;
}

interface SyncStatusIndicatorProps {
  /**
   * Array of sync statuses for different collections
   */
  collections: CollectionSyncStatus[];
  /**
   * Optional className for styling
   */
  className?: string;
}

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
 * Get the overall sync status from a list of collection statuses
 */
function getOverallStatus(
  collections: CollectionSyncStatus[],
): "connected" | "syncing" | "disconnected" | "error" {
  if (collections.some((c) => c.error)) return "error";
  if (collections.some((c) => c.isSyncing)) return "syncing";
  if (collections.every((c) => c.isConnected)) return "connected";
  return "disconnected";
}

/**
 * Get the icon for the overall sync status
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
 * Individual collection status row
 */
function CollectionStatusRow({ status }: { status: CollectionSyncStatus }) {
  return (
    <div className="hover:bg-muted/50 flex items-center justify-between rounded-md px-3 py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{status.displayName}</span>
        <span className="text-muted-foreground text-xs">
          {status.error
            ? "Error syncing"
            : status.isSyncing
              ? "Syncing..."
              : status.isConnected
                ? "Connected"
                : "Disconnected"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">
          {formatRelativeTime(status.lastSyncedAt)}
        </span>
        {status.isConnected ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : status.isSyncing ? (
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
        ) : status.error ? (
          <CloudAlert className="text-destructive h-4 w-4" />
        ) : (
          <CloudOff className="text-muted-foreground h-4 w-4" />
        )}
      </div>
    </div>
  );
}

/**
 * SyncStatusIndicator Component
 *
 * Displays a cloud icon that indicates the overall sync status.
 * Clicking opens a popover with detailed status for each collection.
 */
export function SyncStatusIndicator({
  collections,
  className,
}: SyncStatusIndicatorProps) {
  const [open, setOpen] = useState(false);

  const overallStatus = getOverallStatus(collections);
  const connectedCount = collections.filter((c) => c.isConnected).length;
  const totalCount = collections.length;
  const hasErrors = collections.some((c) => c.error);
  const hasPendingUpdates = collections.some((c) => c.pendingUpdates > 0);

  const connectedCollections = collections.filter((c) => c.isConnected);
  const disconnectedCollections = collections.filter((c) => !c.isConnected);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          className={cn("relative gap-1 px-2", className)}
          variant="ghost"
          size="sm"
          aria-label={`Sync status: ${overallStatus}`}
        >
          <StatusIcon
            className="h-5 w-5"
            status={overallStatus}
          />
          {hasErrors && (
            <Badge
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center p-0 text-[10px]"
              variant="destructive"
            >
              !
            </Badge>
          )}
          {hasPendingUpdates && !hasErrors && (
            <Badge
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center p-0 text-[10px]"
              variant="secondary"
            >
              {collections.reduce((acc, c) => acc + c.pendingUpdates, 0)}
            </Badge>
          )}
          <ChevronDown className="text-muted-foreground h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
      >
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Sync Status</h3>
            <Badge
              variant={overallStatus === "connected" ? "default" : "secondary"}
            >
              {connectedCount}/{totalCount} connected
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time data synchronization status
          </p>
        </div>

        <Tabs
          className="w-full"
          defaultValue="connected"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
            <TabsTrigger
              className="rounded-none"
              value="connected"
            >
              Connected ({connectedCollections.length})
            </TabsTrigger>
            <TabsTrigger
              className="rounded-none"
              value="disconnected"
            >
              Offline ({disconnectedCollections.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            className="m-0 max-h-64 overflow-y-auto"
            value="connected"
          >
            {connectedCollections.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center text-sm">
                No collections connected
              </div>
            ) : (
              <div className="p-2">
                {connectedCollections.map((status) => (
                  <CollectionStatusRow
                    key={status.name}
                    status={status}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent
            className="m-0 max-h-64 overflow-y-auto"
            value="disconnected"
          >
            {disconnectedCollections.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center text-sm">
                All collections are connected
              </div>
            ) : (
              <div className="p-2">
                {disconnectedCollections.map((status) => (
                  <CollectionStatusRow
                    key={status.name}
                    status={status}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="bg-muted/30 border-t p-3">
          <p className="text-muted-foreground text-center text-xs">
            Data syncs automatically when connected
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
