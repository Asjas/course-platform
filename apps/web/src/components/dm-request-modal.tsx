import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import GitHubMessageEditor from "~/components/github-message-editor";
import { trpcClient } from "~/lib/trpc.client";

interface DMRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
}

export function DMRequestModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
}: DMRequestModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) {
      toast.error("Please provide a reason for your DM request");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Sending DM request...");

    try {
      const result = await trpcClient.directMessages.requestDM.mutate({
        recipientId,
        message: message.trim(),
      });

      if (result.autoApproved && result.conversationId) {
        toast.success(
          `DM request auto-approved! You can now message ${recipientName}.`,
          { id: toastId },
        );
      } else {
        toast.success(`DM request sent to ${recipientName}!`, { id: toastId });
      }

      setMessage("");
      onClose();
    } catch (error) {
      console.error("DM request error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send DM request";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      setMessage("");
      onClose();
    }
  }

  return (
    <Dialog
      className="relative z-50"
      open={isOpen}
      onClose={handleClose}
    >
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/50"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Request Direct Message with {recipientName}
            </DialogTitle>
            <button
              className="cursor-pointer rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close"
              type="button"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Please explain why you'd like to message {recipientName}. They will
            see this message when deciding whether to approve your request.
          </p>

          <div className="mb-4">
            <GitHubMessageEditor
              id="dm-request-message"
              value={message}
              onChange={setMessage}
              placeholder="Why do you want to send a direct message?"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={handleClose}
              disabled={isSubmitting}
              type="button"
            >
              Cancel
            </button>
            <button
              className="cursor-pointer rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              type="button"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
