import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { trpc } from "~/lib/trpc.client";

interface DMRequestSheetProps {
  requestId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DMRequestSheet({
  requestId,
  isOpen,
  onOpenChange,
}: DMRequestSheetProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch request details
  const { data: request, refetch } = useQuery({
    ...trpc.directMessages.getDMRequest.queryOptions({ requestId }),
    enabled: isOpen && !!requestId,
  });

  const approveMutation = useMutation(
    trpc.directMessages.approveDMRequest.mutationOptions({
      keyPrefix: undefined,
    }),
  );

  const denyMutation = useMutation(
    trpc.directMessages.denyDMRequest.mutationOptions({
      keyPrefix: undefined,
    }),
  );

  async function handleApprove() {
    if (!request) return;

    setIsProcessing(true);
    const toastId = toast.loading("Approving request...");

    try {
      await approveMutation.mutateAsync({ requestId });
      await refetch();
      toast.success("Request approved!", { id: toastId });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to approve DM request:", error);
      toast.error("Failed to approve request", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDeny() {
    if (!request) return;

    setIsProcessing(true);
    const toastId = toast.loading("Denying request...");

    try {
      await denyMutation.mutateAsync({ requestId });
      await refetch();
      toast.success("Request denied", { id: toastId });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to deny DM request:", error);
      toast.error("Failed to deny request", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  }

  if (!request) {
    return null;
  }

  const requester = request.requester;
  const isPending = request.status === "pending";

  return (
    <Sheet
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        className="w-[400px] sm:w-[540px]"
        side="right"
      >
        <SheetHeader>
          <SheetTitle>Direct Message Request</SheetTitle>
          <SheetDescription>
            {requester.displayUsername || requester.username || requester.name}{" "}
            wants to send you a direct message
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3">
            {requester.image ? (
              <img
                className="h-12 w-12 rounded-full"
                src={requester.image}
                alt={requester.name}
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: requester.color || "#6B7280" }}
              >
                {requester.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold">{requester.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{requester.displayUsername || requester.username}
              </p>
            </div>
          </div>

          {/* Request message */}
          {request.message && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Reason for request:
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                {request.message}
              </p>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Status:
            </span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                request.status === "approved"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : request.status === "denied"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>

          {/* Action buttons */}
          {isPending && (
            <div className="flex gap-3 pt-4">
              <button
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
                onClick={handleApprove}
                disabled={isProcessing}
                type="button"
              >
                <CheckIcon className="h-4 w-4" />
                Approve
              </button>
              <button
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
                onClick={handleDeny}
                disabled={isProcessing}
                type="button"
              >
                <XIcon className="h-4 w-4" />
                Deny
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
