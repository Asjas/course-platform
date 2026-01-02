import { createFileRoute } from "@tanstack/react-router";
import { intlFormat } from "date-fns";
import { EyeIcon } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "~/components/empty-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
} from "~/components/ui/table";
import {
  type GdprAuditLog,
  GdprAuditLogsCollection,
  useGdprAuditLogs,
} from "~/lib/db.collections";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  loader: async () => {
    await GdprAuditLogsCollection.preload();
  },
  component: AdminAuditPage,
});

type TabType = "gdpr";

function AdminAuditPage() {
  const [activeTab, setActiveTab] = useState<TabType>("gdpr");
  const [selectedLog, setSelectedLog] = useState<GdprAuditLog | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  // Data is prefetched in the loader, so it should be available immediately
  const { data: gdprLogs } = useGdprAuditLogs();

  function handleViewLog(log: GdprAuditLog) {
    setSelectedLog(log);
    setIsDetailsSheetOpen(true);
  }

  function handleDetailsSheetOpenChange(open: boolean) {
    setIsDetailsSheetOpen(open);
    if (!open) {
      setSelectedLog(null);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Audit Logs
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            View audit trails and compliance logs for regulatory requirements.
          </p>
        </div>
      </div>

      {/* Simple Tab Navigation */}
      <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
        <nav
          className="-mb-px flex space-x-8"
          aria-label="Audit log categories"
        >
          <button
            className={cn(
              "cursor-pointer border-b-2 px-1 pb-4 text-sm font-medium",
              activeTab === "gdpr"
                ? "border-green-500 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
            )}
            onClick={() => setActiveTab("gdpr")}
            aria-current={activeTab === "gdpr" ? "page" : undefined}
          >
            GDPR Data Exports
          </button>
          {/* Placeholder for future tabs */}
          <button
            className="cursor-not-allowed border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-400"
            disabled
            aria-disabled="true"
          >
            Security Events (Coming Soon)
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "gdpr" && (
          <GdprAuditLogsTab
            logs={gdprLogs || []}
            onViewLog={handleViewLog}
          />
        )}
      </div>

      {/* Details Sheet */}
      <Sheet
        open={isDetailsSheetOpen}
        onOpenChange={handleDetailsSheetOpenChange}
      >
        <SheetContent
          className="w-full sm:max-w-2xl"
          side="right"
        >
          <SheetHeader>
            <SheetTitle>Audit Log Details</SheetTitle>
            <SheetDescription>
              Complete details for this audit log entry
            </SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="custom-scrollbar mt-6 space-y-6 overflow-y-auto pr-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Log ID
                </h3>
                <p className="mt-1 text-sm break-all text-gray-600 dark:text-gray-400">
                  {selectedLog.id}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  User
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {selectedLog.user?.name} ({selectedLog.user?.email})
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                  User ID: {selectedLog.userId}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Action Type
                </h3>
                <p className="mt-1 text-sm text-gray-600 capitalize dark:text-gray-400">
                  {selectedLog.actionType.replace(/_/g, " ")}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Status
                </h3>
                <span
                  className={cn(
                    "mt-1 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium capitalize",
                    selectedLog.status === "success"
                      ? "bg-green-100 text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400"
                      : selectedLog.status === "failure"
                        ? "bg-red-100 text-red-700 ring-1 ring-red-500/50 ring-inset dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500/50 ring-inset dark:bg-yellow-900/30 dark:text-yellow-400",
                  )}
                >
                  {selectedLog.status}
                </span>
              </div>

              {selectedLog.exportFormat && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Export Format
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 uppercase dark:text-gray-400">
                    {selectedLog.exportFormat}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  IP Address
                </h3>
                <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400">
                  {selectedLog.ipAddress || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  User Agent
                </h3>
                <p className="mt-1 text-sm break-all text-gray-600 dark:text-gray-400">
                  {selectedLog.userAgent || "N/A"}
                </p>
              </div>

              {selectedLog.errorMessage && (
                <div>
                  <h3 className="text-sm font-medium text-red-900 dark:text-red-400">
                    Error Message
                  </h3>
                  <p className="mt-1 text-sm break-words text-red-600 dark:text-red-400">
                    {selectedLog.errorMessage}
                  </p>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Metadata
                  </h3>
                  <pre className="mt-1 overflow-x-auto rounded-md bg-gray-100 p-3 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    {selectedLog.metadata}
                  </pre>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Timestamp
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {intlFormat(new Date(selectedLog.createdAt), {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    timeZoneName: "short",
                  })}
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface GdprAuditLogsTabProps {
  logs: GdprAuditLog[];
  onViewLog: (log: GdprAuditLog) => void;
}

function GdprAuditLogsTab({ logs, onViewLog }: GdprAuditLogsTabProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        title="No audit logs yet"
        description="GDPR data export audit logs will appear here once users request their data."
      />
    );
  }

  return (
    <div className="flow-root">
      <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <Table aria-label="GDPR audit logs with user, action, status, format, and timestamp">
            <TableHeader>
              <TableHeaderRow>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Format</TableHeaderCell>
                <TableHeaderCell>IP Address</TableHeaderCell>
                <TableHeaderCell>Timestamp</TableHeaderCell>
                <TableHeaderCell>
                  <span className="sr-only">Actions</span>
                </TableHeaderCell>
              </TableHeaderRow>
            </TableHeader>

            <TableBody>
              {logs.map((log) => (
                <TableBodyRow key={log.id}>
                  <TableBodyCell className="font-medium">
                    <div>
                      <div className="text-gray-900 dark:text-white">
                        {log.user?.name || "Unknown User"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {log.user?.email}
                      </div>
                    </div>
                  </TableBodyCell>

                  <TableBodyCell className="text-gray-600 capitalize dark:text-gray-300">
                    {log.actionType.replace(/_/g, " ")}
                  </TableBodyCell>

                  <TableBodyCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium capitalize",
                        log.status === "success"
                          ? "bg-green-100 text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400"
                          : log.status === "failure"
                            ? "bg-red-100 text-red-700 ring-1 ring-red-500/50 ring-inset dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500/50 ring-inset dark:bg-yellow-900/30 dark:text-yellow-400",
                      )}
                    >
                      {log.status}
                    </span>
                  </TableBodyCell>

                  <TableBodyCell className="text-gray-600 uppercase dark:text-gray-300">
                    {log.exportFormat || "—"}
                  </TableBodyCell>

                  <TableBodyCell className="font-mono text-sm text-gray-600 dark:text-gray-300">
                    {log.ipAddress || "—"}
                  </TableBodyCell>

                  <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                    {intlFormat(new Date(log.createdAt), {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </TableBodyCell>

                  <TableBodyCell>
                    <button
                      className="cursor-pointer text-blue-400 hover:text-blue-300"
                      type="button"
                      onClick={() => onViewLog(log)}
                    >
                      <EyeIcon
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      <span className="sr-only">View audit log details</span>
                    </button>
                  </TableBodyCell>
                </TableBodyRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
