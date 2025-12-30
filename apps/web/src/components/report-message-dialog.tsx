import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ulid } from "ulid";
import { trpc } from "~/lib/trpc.client";

interface ReportMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  channelId: string;
  messageContent: string;
  messageAuthor: string;
}

const reportReasons = [
  { value: "spam", label: "Spam or advertising" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "offensive", label: "Offensive language" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
];

export default function ReportMessageDialog({
  open,
  onOpenChange,
  messageId,
  channelId,
  messageContent,
  messageAuthor,
}: ReportMessageDialogProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reportMessageMutation = useMutation(
    trpc.chatReports.reportMessage.mutationOptions({ keyPrefix: undefined }),
  );

  function handleClose() {
    setSelectedReason("");
    setCustomReason("");
    onOpenChange(false);
  }

  async function handleSubmit() {
    if (!selectedReason) {
      toast.error("Please select a reason for reporting this message");
      return;
    }

    const reason =
      selectedReason === "other" && customReason.trim()
        ? customReason.trim()
        : reportReasons.find((r) => r.value === selectedReason)?.label || "";

    if (!reason) {
      toast.error("Please provide a reason for the report");
      return;
    }

    const toastId = toast.loading("Submitting report...");

    try {
      await reportMessageMutation.mutateAsync({
        id: ulid(),
        messageId,
        channelId,
        reason,
        messageContent,
        messageAuthor,
      });

      toast.success(
        "Message reported successfully. Thank you for your feedback.",
        {
          id: toastId,
        },
      );

      handleClose();
    } catch (error) {
      console.error("Error reporting message:", error);
      toast.error("Failed to report message. Please try again.", {
        id: toastId,
      });
    }
  }

  return (
    <Dialog
      className="relative z-50"
      open={open}
      onClose={handleClose}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Report Message
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Help us keep the chat safe by reporting inappropriate messages.
              </DialogDescription>
            </div>
            <button
              className="cursor-pointer rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleClose}
              type="button"
              aria-label="Close dialog"
            >
              <XIcon
                className="text-gray-500 dark:text-gray-400"
                size={20}
              />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Message from {messageAuthor}:</span>
              <br />
              <span className="italic">
                "{messageContent.substring(0, 100)}
                {messageContent.length > 100 ? "..." : ""}"
              </span>
            </p>
          </div>

          <div className="mt-6">
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="report-reason"
            >
              Why are you reporting this message?
            </label>
            <select
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              id="report-reason"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              {reportReasons.map((reason) => (
                <option
                  key={reason.value}
                  value={reason.value}
                >
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {selectedReason === "other" && (
            <div className="mt-4">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="custom-reason"
              >
                Please describe the issue
              </label>
              <textarea
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                id="custom-reason"
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please provide details..."
              />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSubmit}
              disabled={reportMessageMutation.isPending}
              type="button"
            >
              {reportMessageMutation.isPending
                ? "Reporting..."
                : "Submit Report"}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
