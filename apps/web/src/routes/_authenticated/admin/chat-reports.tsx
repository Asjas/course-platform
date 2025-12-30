import { createFileRoute } from "@tanstack/react-router";
import { intlFormat } from "date-fns";
import {
  CheckCircle2Icon,
  EyeIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
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
import { ChatReportsCollection, useChatReports } from "~/lib/db.collections";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/chat-reports")({
  loader: async () => {
    await ChatReportsCollection.preload();
  },
  component: AdminChatReportsPage,
});

function AdminChatReportsPage() {
  const { data: reports, isLoading } = useChatReports();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reviewConfirmOpen, setReviewConfirmOpen] = useState(false);
  const [dismissConfirmOpen, setDismissConfirmOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<string | null>(null);

  const viewingReportData = reports?.find((r) => r.id === viewingReport);

  function handleDeleteClick(reportId: string) {
    setSelectedReportId(reportId);
    setDeleteConfirmOpen(true);
  }

  function handleReviewClick(reportId: string) {
    setSelectedReportId(reportId);
    setReviewConfirmOpen(true);
  }

  function handleDismissClick(reportId: string) {
    setSelectedReportId(reportId);
    setDismissConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!selectedReportId) return;

    const toastId = toast.loading("Deleting report...");

    try {
      await ChatReportsCollection.delete(selectedReportId);
      toast.success("Report deleted successfully.", { id: toastId });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report.", { id: toastId });
    } finally {
      setSelectedReportId(null);
    }
  }

  async function handleConfirmReview() {
    if (!selectedReportId) return;

    const toastId = toast.loading("Marking as reviewed...");

    try {
      const tx = ChatReportsCollection.update(selectedReportId, (draft) => {
        draft.status = "reviewed";
        draft.reviewedAt = new Date();
      });
      await tx.isPersisted.promise;
      toast.success("Report marked as reviewed.", { id: toastId });
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report.", { id: toastId });
    } finally {
      setSelectedReportId(null);
    }
  }

  async function handleConfirmDismiss() {
    if (!selectedReportId) return;

    const toastId = toast.loading("Dismissing report...");

    try {
      const tx = ChatReportsCollection.update(selectedReportId, (draft) => {
        draft.status = "dismissed";
        draft.reviewedAt = new Date();
      });
      await tx.isPersisted.promise;
      toast.success("Report dismissed.", { id: toastId });
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to dismiss report.", { id: toastId });
    } finally {
      setSelectedReportId(null);
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  const pendingReports = reports?.filter((r) => r.status === "pending") || [];
  const reviewedReports = reports?.filter((r) => r.status !== "pending") || [];

  return (
    <div className="flex h-full flex-col">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Chat Message Reports
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Review and moderate reported chat messages. Take action on
            inappropriate content.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              Pending:{" "}
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                {pendingReports.length}
              </span>
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              Reviewed:{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {reviewedReports.length}
              </span>
            </span>
          </div>
        </div>
      </div>

      {reports && reports.length > 0 ? (
        <div className="mt-12 flow-root">
          <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>Channel</TableHeaderCell>
                    <TableHeaderCell>Author</TableHeaderCell>
                    <TableHeaderCell>Reason</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Reported</TableHeaderCell>
                    <TableHeaderCell>
                      <span className="sr-only">Actions</span>
                    </TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>

                <TableBody>
                  {reports.map((report) => (
                    <TableBodyRow key={report.id}>
                      <TableBodyCell className="font-medium">
                        #{report.channelId}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {report.messageAuthor}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        <span className="line-clamp-2">{report.reason}</span>
                      </TableBodyCell>

                      <TableBodyCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
                            report.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500/50 ring-inset dark:bg-yellow-900/30 dark:text-yellow-400"
                              : report.status === "reviewed"
                                ? "bg-green-100 text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-700 ring-1 ring-gray-500/50 ring-inset dark:bg-gray-900/30 dark:text-gray-400",
                          )}
                        >
                          {report.status === "pending" ? (
                            <>
                              <XCircleIcon className="mr-1 h-3 w-3" />
                              Pending
                            </>
                          ) : report.status === "reviewed" ? (
                            <>
                              <CheckCircle2Icon className="mr-1 h-3 w-3" />
                              Reviewed
                            </>
                          ) : (
                            "Dismissed"
                          )}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                        {intlFormat(new Date(report.createdAt), {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </TableBodyCell>

                      <TableBodyCell>
                        <div className="flex justify-around gap-2">
                          <button
                            className="cursor-pointer text-blue-400 hover:text-blue-300"
                            type="button"
                            onClick={() => setViewingReport(report.id)}
                            title="View details"
                          >
                            <EyeIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">View report details</span>
                          </button>
                          {report.status === "pending" && (
                            <>
                              <button
                                className="cursor-pointer text-green-400 hover:text-green-300"
                                type="button"
                                onClick={() => handleReviewClick(report.id)}
                                title="Mark as reviewed"
                              >
                                <CheckCircle2Icon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">
                                  Mark as reviewed
                                </span>
                              </button>
                              <button
                                className="cursor-pointer text-gray-400 hover:text-gray-300"
                                type="button"
                                onClick={() => handleDismissClick(report.id)}
                                title="Dismiss report"
                              >
                                <XCircleIcon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">Dismiss report</span>
                              </button>
                            </>
                          )}
                          <button
                            className="cursor-pointer text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteClick(report.id)}
                            type="button"
                            title="Delete report"
                          >
                            <Trash2Icon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">Delete report</span>
                          </button>
                        </div>
                      </TableBodyCell>
                    </TableBodyRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No reports found"
          description="There are no chat message reports to display."
        />
      )}

      {/* View Report Dialog */}
      {viewingReportData && (
        <ConfirmDialog
          open={!!viewingReport}
          onOpenChange={(open) => !open && setViewingReport(null)}
          onConfirm={() => setViewingReport(null)}
          title="Report Details"
          description={
            <div className="space-y-3 text-left">
              <div>
                <span className="font-semibold">Channel:</span> #
                {viewingReportData.channelId}
              </div>
              <div>
                <span className="font-semibold">Message Author:</span>{" "}
                {viewingReportData.messageAuthor}
              </div>
              <div>
                <span className="font-semibold">Reason:</span>{" "}
                {viewingReportData.reason}
              </div>
              <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-800">
                <span className="font-semibold">Message Content:</span>
                <p className="mt-1 text-sm">
                  {viewingReportData.messageContent}
                </p>
              </div>
              <div>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={cn(
                    viewingReportData.status === "pending"
                      ? "text-yellow-600"
                      : viewingReportData.status === "reviewed"
                        ? "text-green-600"
                        : "text-gray-600",
                  )}
                >
                  {viewingReportData.status}
                </span>
              </div>
            </div>
          }
          confirmText="Close"
          variant="default"
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Report"
        description={`Are you sure you want to delete this report? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmDialog
        open={reviewConfirmOpen}
        onOpenChange={setReviewConfirmOpen}
        onConfirm={handleConfirmReview}
        title="Mark as Reviewed"
        description="Mark this report as reviewed? The report will remain in the system for records."
        confirmText="Mark as Reviewed"
        cancelText="Cancel"
        variant="default"
      />

      <ConfirmDialog
        open={dismissConfirmOpen}
        onOpenChange={setDismissConfirmOpen}
        onConfirm={handleConfirmDismiss}
        title="Dismiss Report"
        description="Dismiss this report? This indicates the report was not valid or actionable."
        confirmText="Dismiss"
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
}
