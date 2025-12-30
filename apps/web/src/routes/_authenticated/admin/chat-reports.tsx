import { createFileRoute } from "@tanstack/react-router";
import { intlFormat } from "date-fns";
import { Trash2Icon, XCircleIcon } from "lucide-react";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { EmptyState } from "~/components/empty-state";
import Loading from "~/components/loading";
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
  type ChatReport,
  ChatReportsCollection,
  useChatReports,
} from "~/lib/db.collections";
import { trpcClient } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/chat-reports")({
  loader: async () => {
    await ChatReportsCollection.preload();
  },
  component: AdminChatReportsPage,
});

function AdminChatReportsPage() {
  const { data: reports, isLoading } = useChatReports();
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"dismiss" | "delete" | null>(
    null,
  );
  const [reportToAction, setReportToAction] = useState<ChatReport | null>(null);

  function handleActionClick(report: ChatReport, type: "dismiss" | "delete") {
    setReportToAction(report);
    setActionType(type);
    setActionConfirmOpen(true);
  }

  async function handleConfirmAction() {
    if (!reportToAction || !actionType) return;

    const toastId = toast.loading(
      actionType === "dismiss" ? "Dismissing report..." : "Deleting message...",
    );

    try {
      if (actionType === "dismiss") {
        await trpcClient.chatReports.updateReportStatus.mutate({
          reportId: reportToAction.id,
          status: "dismissed",
        });
        await ChatReportsCollection.utils.refetch();
        toast.success("Report dismissed successfully.", { id: toastId });
      } else if (actionType === "delete") {
        await trpcClient.chatReports.deleteReportedMessage.mutate({
          reportId: reportToAction.id,
          messageId: reportToAction.messageId,
          channelId: reportToAction.channelId,
        });
        await ChatReportsCollection.utils.refetch();
        toast.success("Message deleted and report marked as actioned.", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(`Error ${actionType}ing report:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to ${actionType} report: ${errorMessage}`, {
        id: toastId,
      });
    } finally {
      setReportToAction(null);
      setActionType(null);
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  const statusBadgeStyles = {
    pending:
      "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    reviewed:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    dismissed:
      "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700",
    actioned:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  };

  const reasonLabels: Record<string, string> = {
    spam: "Spam",
    harassment: "Harassment",
    inappropriate: "Inappropriate",
    offensive: "Offensive",
    violence: "Violence",
    illegal: "Illegal Activity",
    other: "Other",
  };

  return (
    <div className="flex h-full flex-col">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Chat Message Reports
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Review and manage reported chat messages from users.
          </p>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <Suspense fallback={<Loading />}>
              {!reports || reports.length === 0 ? (
                <EmptyState
                  title="No reports found"
                  description="There are no chat message reports to review."
                />
              ) : (
                <div className="ring-opacity-5 dark:ring-opacity-10 overflow-hidden shadow ring-1 ring-black sm:rounded-lg dark:ring-white">
                  <Table>
                    <TableHeader>
                      <TableHeaderRow>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Reason</TableHeaderCell>
                        <TableHeaderCell>Channel</TableHeaderCell>
                        <TableHeaderCell>Reporter</TableHeaderCell>
                        <TableHeaderCell>Message Author</TableHeaderCell>
                        <TableHeaderCell>Reported At</TableHeaderCell>
                        <TableHeaderCell>
                          <span className="sr-only">Actions</span>
                        </TableHeaderCell>
                      </TableHeaderRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableBodyRow key={report.id}>
                          <TableBodyCell>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium capitalize",
                                statusBadgeStyles[report.status],
                              )}
                            >
                              {report.status}
                            </span>
                          </TableBodyCell>
                          <TableBodyCell>
                            <span className="font-medium">
                              {reasonLabels[report.reason]}
                            </span>
                            {report.details && (
                              <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                                {report.details}
                              </p>
                            )}
                          </TableBodyCell>
                          <TableBodyCell>
                            <span className="font-mono text-sm">
                              #{report.channelId}
                            </span>
                          </TableBodyCell>
                          <TableBodyCell>
                            <div>
                              <p className="font-medium">
                                {report.reporter?.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {report.reporter?.email}
                              </p>
                            </div>
                          </TableBodyCell>
                          <TableBodyCell>
                            <span className="font-medium">
                              {report.messageAuthor}
                            </span>
                            <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                              {report.messageContent}
                            </p>
                          </TableBodyCell>
                          <TableBodyCell>
                            {intlFormat(
                              new Date(report.createdAt),
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                              { locale: "en-US" },
                            )}
                          </TableBodyCell>
                          <TableBodyCell>
                            <div className="flex items-center gap-2">
                              {report.status === "pending" && (
                                <>
                                  <button
                                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    onClick={() =>
                                      handleActionClick(report, "dismiss")
                                    }
                                    title="Dismiss report"
                                  >
                                    <XCircleIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={() =>
                                      handleActionClick(report, "delete")
                                    }
                                    title="Delete message"
                                  >
                                    <Trash2Icon className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                              {report.status !== "pending" && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {report.status === "dismissed" && "Dismissed"}
                                  {report.status === "actioned" && "Actioned"}
                                  {report.status === "reviewed" && "Reviewed"}
                                  {report.reviewedAt && (
                                    <span className="block">
                                      {intlFormat(
                                        new Date(report.reviewedAt),
                                        {
                                          month: "short",
                                          day: "numeric",
                                        },
                                        { locale: "en-US" },
                                      )}
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </TableBodyCell>
                        </TableBodyRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={actionConfirmOpen}
        onOpenChange={setActionConfirmOpen}
        onConfirm={handleConfirmAction}
        title={
          actionType === "dismiss"
            ? "Dismiss Report"
            : "Delete Reported Message"
        }
        description={
          actionType === "dismiss"
            ? "Are you sure you want to dismiss this report? The report will be marked as reviewed but no action will be taken on the message."
            : "Are you sure you want to delete this message? This will permanently remove it from the chat and mark the report as actioned. This action cannot be undone."
        }
        confirmText={actionType === "dismiss" ? "Dismiss" : "Delete Message"}
        cancelText="Cancel"
        variant={actionType === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}
