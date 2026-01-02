import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@packages/shared-ui/components/alert-dialog";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import FieldInfo from "~/components/field-info";
import type { Purchase } from "~/lib/collections/purchases";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";
import {
  type RefundReason,
  refundPurchaseSchema,
  refundReasonOptions,
} from "~/schema/refund-purchase";

interface RefundPurchaseModalProps {
  purchase: Purchase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RefundPurchaseModal({
  purchase,
  open,
  onOpenChange,
}: RefundPurchaseModalProps) {
  const [isRefunding, setIsRefunding] = useState(false);

  const form = useForm({
    defaultValues: {
      orderId: purchase?.id ?? "",
      reason: "customer_request" as RefundReason,
      comment: "",
    },
    validators: {
      onSubmit: refundPurchaseSchema,
    },
    onSubmit: async ({ value }) => {
      if (!purchase) return;

      setIsRefunding(true);
      const toastId = toast.loading("Processing refund...");

      try {
        await trpcClient.purchases.refund.mutate({
          orderId: value.orderId,
          reason: value.reason,
          comment: value.comment || undefined,
        });

        // Invalidate purchases query to refresh the list
        await queryClient.invalidateQueries({
          queryKey: trpc.purchases.getAll.queryKey(),
        });

        toast.success("Refund processed successfully!", { id: toastId });
        onOpenChange(false);
      } catch (error) {
        console.error("Refund error:", error);
        toast.error("Failed to process refund. Please try again.", {
          id: toastId,
        });
      } finally {
        setIsRefunding(false);
      }
    },
  });

  if (!purchase) return null;

  const totalAmount = purchase.totalAmount / 100;

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Refund Purchase</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to refund this purchase? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
        >
          <div className="my-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {purchase.product?.name ?? "Unknown Product"}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {purchase.customer.email}
            </div>
            <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">
                Refund Amount
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {purchase.currency.toUpperCase()} {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <form.Field
            name="reason"
            children={(field) => (
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor={field.name}
                >
                  Refund Reason
                </label>
                <div className="mt-2">
                  <select
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.value as RefundReason)
                    }
                    onBlur={field.handleBlur}
                  >
                    {refundReasonOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          <form.Field
            name="comment"
            children={(field) => (
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor={field.name}
                >
                  Internal Comment{" "}
                  <span className="text-gray-500">(optional)</span>
                </label>
                <div className="mt-2">
                  <textarea
                    className="block w-full resize-none rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                    id={field.name}
                    name={field.name}
                    rows={3}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Internal notes about this refund..."
                  />
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <button
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-100 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-800"
                type="button"
              >
                Cancel
              </button>
            </AlertDialogCancel>
            <button
              className={cn(
                "cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
                isRefunding
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-red-700 active:bg-red-800",
              )}
              type="submit"
              disabled={isRefunding}
            >
              {isRefunding ? "Processing..." : "Confirm Refund"}
            </button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
