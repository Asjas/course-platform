import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Radio,
  RadioGroup,
} from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { trpcClient } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

interface ReportMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  channelId: string;
  messageContent: string;
  messageAuthor: string;
}

const reportReasons = [
  {
    value: "spam",
    label: "Spam",
    description: "Repetitive or unsolicited content",
  },
  {
    value: "harassment",
    label: "Harassment",
    description: "Bullying or threatening behavior",
  },
  {
    value: "inappropriate",
    label: "Inappropriate",
    description: "Content not suitable for this platform",
  },
  {
    value: "offensive",
    label: "Offensive",
    description: "Hateful or discriminatory language",
  },
  {
    value: "violence",
    label: "Violence",
    description: "Threats or incitement of violence",
  },
  {
    value: "illegal",
    label: "Illegal Activity",
    description: "Promoting illegal activities",
  },
  { value: "other", label: "Other", description: "Other reason not listed" },
] as const;

export function ReportMessageDialog({
  isOpen,
  onClose,
  messageId,
  channelId,
  messageContent,
  messageAuthor,
}: ReportMessageDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>(
    reportReasons[0].value,
  );
  const [details, setDetails] = useState("");

  const reportMutation = useMutation({
    mutationFn: async () => {
      return trpcClient.chatReports.reportMessage.mutate({
        messageId,
        channelId,
        reason: selectedReason as
          | "spam"
          | "harassment"
          | "inappropriate"
          | "offensive"
          | "violence"
          | "illegal"
          | "other",
        details: details.trim() || undefined,
        messageContent,
        messageAuthor,
      });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const toastId = toast.loading("Reporting message...");

    reportMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Message reported successfully. Admins will review it.", {
          id: toastId,
        });
        onClose();
        // Reset form
        setSelectedReason(reportReasons[0].value);
        setDetails("");
      },
      onError: (error) => {
        console.error("Error reporting message:", error);
        toast.error("Failed to report message. Please try again.", {
          id: toastId,
        });
      },
    });
  }

  function handleClose() {
    if (!reportMutation.isPending) {
      onClose();
      // Reset form after dialog closes
      setTimeout(() => {
        setSelectedReason(reportReasons[0].value);
        setDetails("");
      }, 300);
    }
  }

  return (
    <Dialog
      className="relative z-50"
      open={isOpen}
      onClose={handleClose}
    >
      <div
        className="fixed inset-0 bg-black/30"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Report Message
          </DialogTitle>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Help keep our community safe by reporting messages that violate our
            guidelines.
          </p>

          <form
            className="mt-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              {/* Message preview */}
              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Message being reported:
                </p>
                <p className="mt-1 line-clamp-3 text-sm text-gray-900 dark:text-white">
                  {messageContent}
                </p>
              </div>

              {/* Reason selection */}
              <div>
                <label
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="reason-selection"
                >
                  Reason for report <span className="text-red-500">*</span>
                </label>
                <RadioGroup
                  className="mt-2 space-y-2"
                  id="reason-selection"
                  value={selectedReason}
                  onChange={setSelectedReason}
                >
                  {reportReasons.map((reason) => (
                    <Radio
                      className={({ checked }) =>
                        cn(
                          "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                          checked
                            ? "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                            : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800",
                        )
                      }
                      key={reason.value}
                      value={reason.value}
                    >
                      {({ checked }) => (
                        <>
                          <div className="flex h-5 items-center">
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border-2 transition-colors",
                                checked
                                  ? "border-green-600 bg-green-600 dark:border-green-500 dark:bg-green-500"
                                  : "border-gray-300 dark:border-gray-600",
                              )}
                            >
                              {checked && (
                                <div className="m-0.5 h-2 w-2 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {reason.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {reason.description}
                            </p>
                          </div>
                        </>
                      )}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>

              {/* Additional details */}
              <div>
                <label
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="details"
                >
                  Additional details (optional)
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-500"
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Provide any additional context..."
                  disabled={reportMutation.isPending}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                type="button"
                onClick={handleClose}
                disabled={reportMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
                type="submit"
                disabled={reportMutation.isPending}
              >
                {reportMutation.isPending ? "Reporting..." : "Report Message"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
