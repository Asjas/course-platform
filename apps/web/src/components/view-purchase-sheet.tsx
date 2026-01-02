import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import type { Purchase } from "~/lib/collections/purchases";
import { cn } from "~/lib/utils";

interface ViewPurchaseSheetProps {
  purchase: Purchase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewPurchaseSheet({
  purchase,
  open,
  onOpenChange,
}: ViewPurchaseSheetProps) {
  if (!purchase) return null;

  const isRefunded = purchase.refundedAmount > 0;
  const totalAmount = purchase.totalAmount / 100;
  const netAmount = (purchase.totalAmount - purchase.taxAmount) / 100;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        className="flex w-full flex-col sm:max-w-lg"
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="text-xl">Purchase Details</SheetTitle>
          <SheetDescription>
            Order placed on {format(new Date(purchase.createdAt), "PPp")}
          </SheetDescription>
        </SheetHeader>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-6">
            {/* Status */}
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
                    isRefunded
                      ? "bg-red-100 text-red-700 ring-1 ring-red-500/50 ring-inset dark:bg-red-900/30 dark:text-red-400"
                      : purchase.paid
                        ? "bg-green-100 text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500/50 ring-inset dark:bg-yellow-900/30 dark:text-yellow-400",
                  )}
                >
                  {isRefunded ? "Refunded" : purchase.paid ? "Paid" : "Pending"}
                </span>
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 capitalize ring-1 ring-gray-300/50 ring-inset dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600/50">
                  {purchase.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Order ID */}
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Order ID
              </span>
              <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                {purchase.id}
              </p>
            </div>

            {/* Invoice Number */}
            {purchase.invoiceNumber && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Invoice Number
                </span>
                <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                  {purchase.invoiceNumber}
                </p>
              </div>
            )}

            {/* Product */}
            {purchase.product && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Product
                </span>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {purchase.product.name}
                </p>
                {purchase.product.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {purchase.product.description}
                  </p>
                )}
                {purchase.product.isRecurring && (
                  <span className="mt-2 inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Recurring
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {purchase.description && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </span>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {purchase.description}
                </p>
              </div>
            )}

            {/* Customer */}
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Customer
              </span>
              <p className="mt-1 text-gray-900 dark:text-white">
                {purchase.customer.name || "N/A"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {purchase.customer.email}
              </p>
            </div>

            {/* Amount */}
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Net Amount
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {purchase.currency.toUpperCase()} {netAmount.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tax
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {purchase.currency.toUpperCase()}{" "}
                  {(purchase.taxAmount / 100).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                <span className="font-medium text-gray-900 dark:text-white">
                  Total
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {purchase.currency.toUpperCase()} {totalAmount.toFixed(2)}
                </span>
              </div>
              {isRefunded && (
                <div className="mt-2 flex justify-between border-t border-red-200 pt-2 dark:border-red-800">
                  <span className="font-medium text-red-600 dark:text-red-400">
                    Refunded
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{purchase.currency.toUpperCase()}{" "}
                    {(purchase.refundedAmount / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Billing Reason */}
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Billing Reason
              </span>
              <p className="mt-1 text-gray-900 capitalize dark:text-white">
                {purchase.billingReason.replace(/_/g, " ")}
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </span>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {format(new Date(purchase.createdAt), "PPp")}
                </p>
              </div>
              {purchase.modifiedAt && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Modified
                  </span>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {format(new Date(purchase.modifiedAt), "PPp")}
                  </p>
                </div>
              )}
            </div>

            {/* Checkout ID */}
            {purchase.checkoutId && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Checkout ID
                </span>
                <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                  {purchase.checkoutId}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            className="w-full cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-100 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-800"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Close
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
