import { createFileRoute } from "@tanstack/react-router";
import { intlFormat } from "date-fns";
import {
  ClipboardCheckIcon,
  ClipboardCopyIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "~/components/confirm-dialog";
import CreateCouponSheet from "~/components/create-coupon-sheet";
import EditCouponSheet from "~/components/edit-coupon-sheet";
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
import { CouponsCollection, useCoupons } from "~/lib/db.collections";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/coupons/")({
  loader: async () => {
    await CouponsCollection.preload();
  },
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  const { data: coupons, isLoading } = useCoupons();
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<
    (typeof coupons)[number] | null
  >(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<{
    id: string;
    code: string;
  } | null>(null);

  function handleEditCoupon(coupon: (typeof coupons)[number]) {
    setEditingCoupon(coupon);
    setIsEditSheetOpen(true);
  }

  function handleEditSheetOpenChange(open: boolean) {
    setIsEditSheetOpen(open);
    if (!open) {
      setEditingCoupon(null);
    }
  }

  function handleDeleteClick(couponId: string, couponCode: string) {
    setCouponToDelete({ id: couponId, code: couponCode });
    setDeleteConfirmOpen(true);
  }

  async function handleCopyCouponCode(couponId: string, couponCode: string) {
    try {
      const canUseNavigatorClipboard =
        typeof navigator !== "undefined" &&
        !!navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function";

      if (canUseNavigatorClipboard) {
        await navigator.clipboard.writeText(couponCode);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = couponCode;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopiedCouponId(couponId);
      setTimeout(() => {
        setCopiedCouponId(null);
      }, 2000);

      toast.success(`Copied coupon code ${couponCode} to clipboard!`);
    } catch {
      toast.error("Failed to copy coupon code. Please try again.");
    }
  }

  function handleConfirmDelete() {
    if (!couponToDelete) return;

    const toastId = toast.loading(`Deleting coupon ${couponToDelete.code}...`);

    try {
      CouponsCollection.delete(couponToDelete.id);

      toast.success(`Coupon ${couponToDelete.code} deleted successfully.`, {
        id: toastId,
      });
    } catch (error) {
      console.error("Error deleting coupon:", error);

      toast.error(
        `An error occurred while deleting the coupon ${couponToDelete.code}. Please try again.`,
        { id: toastId },
      );
    } finally {
      setCouponToDelete(null);
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Coupons
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage discount coupons. Create, edit, and track usage of all
            coupons.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 sm:ml-16">
          <button
            className="inline-flex cursor-pointer items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 active:bg-green-800"
            type="button"
            onClick={() => setIsCreateSheetOpen(true)}
          >
            Create New Coupon
          </button>
        </div>
      </div>

      {coupons.length > 0 ? (
        <div className="mt-12 flow-root">
          <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table aria-label="Discount coupons with code, type, value, redemptions, validity dates, and actions">
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>Code</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Value</TableHeaderCell>
                    <TableHeaderCell>Redemptions</TableHeaderCell>
                    <TableHeaderCell>Valid From</TableHeaderCell>
                    <TableHeaderCell>Valid Until</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>
                      <span className="sr-only">Table Actions</span>
                    </TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>

                <TableBody>
                  {coupons.map((coupon) => (
                    <TableBodyRow key={coupon.id}>
                      <TableBodyCell className="font-medium">
                        <code className="rounded bg-gray-200 px-2 py-1 text-sm text-gray-800 dark:bg-gray-600/75 dark:text-white">
                          {coupon.code}
                        </code>
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {coupon.discountType === "percentage"
                          ? "Percentage"
                          : "Fixed Amount"}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue} %`
                          : `$ ${coupon.discountValue.toFixed(2)}`}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        <span
                          className={cn(
                            coupon.redemptionLimit &&
                              coupon.redemptions.length >=
                                coupon.redemptionLimit
                              ? "text-red-600 dark:text-red-400"
                              : "",
                          )}
                        >
                          {coupon.redemptions.length}
                          {coupon.redemptionLimit
                            ? ` / ${coupon.redemptionLimit}`
                            : " (Unlimited)"}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                        {intlFormat(new Date(coupon.validFrom), {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableBodyCell>

                      <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                        {coupon.validUntil ? (
                          intlFormat(new Date(coupon.validUntil), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        ) : (
                          <span className="text-gray-400 italic dark:text-gray-500">
                            No expiry
                          </span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
                            coupon.active
                              ? "bg-green-100 text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 ring-1 ring-red-500/50 ring-inset dark:bg-red-900/30 dark:text-red-400",
                          )}
                        >
                          {coupon.active ? "Active" : "Inactive"}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell>
                        <div className="flex justify-around gap-2">
                          <button
                            className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            onClick={() =>
                              handleCopyCouponCode(coupon.id, coupon.code)
                            }
                          >
                            {copiedCouponId === coupon.id ? (
                              <ClipboardCheckIcon
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            ) : (
                              <ClipboardCopyIcon
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            )}

                            <span className="sr-only">
                              Copy coupon code {coupon.code}
                            </span>
                          </button>
                          <button
                            className="cursor-pointer text-blue-400 hover:text-blue-300"
                            type="button"
                            onClick={() => handleEditCoupon(coupon)}
                          >
                            <PencilIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">
                              Edit coupon {coupon.code}
                            </span>
                          </button>
                          <button
                            className="cursor-pointer text-red-400 hover:text-red-300"
                            onClick={() =>
                              handleDeleteClick(coupon.id, coupon.code)
                            }
                          >
                            <Trash2Icon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">
                              Delete coupon {coupon.code}
                            </span>
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
          title="No coupons found"
          description="Get started by creating a new coupon."
        />
      )}

      <EditCouponSheet
        coupon={editingCoupon}
        open={isEditSheetOpen}
        onOpenChange={handleEditSheetOpenChange}
      />

      <CreateCouponSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Coupon"
        description={`Are you sure you want to delete the coupon ${couponToDelete?.code}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
