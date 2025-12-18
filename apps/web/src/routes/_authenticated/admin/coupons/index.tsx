import { Link, createFileRoute } from "@tanstack/react-router";
import { intlFormat } from "date-fns";
import {
  ClipboardCheckIcon,
  ClipboardCopyIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-white md:text-3xl">
            Coupons
          </h1>

          <p className="mt-2 text-sm text-gray-300">
            Manage discount coupons. Create, edit, and track usage of all
            coupons.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 sm:ml-16">
          <Link
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 active:bg-green-800"
            to="/admin/coupons/create"
          >
            Create New Coupon
          </Link>
        </div>
      </div>

      {coupons.length > 0 ? (
        <div className="mt-12 flow-root">
          <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table>
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
                      <TableBodyCell className="font-medium text-white">
                        <code className="rounded bg-gray-600/75 px-2 py-1 text-sm">
                          {coupon.code}
                        </code>
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-300">
                        {coupon.discountType === "percentage"
                          ? "Percentage"
                          : "Fixed Amount"}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-300">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue} %`
                          : `$ ${coupon.discountValue.toFixed(2)}`}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-300">
                        <span
                          className={cn(
                            coupon.redemptionLimit &&
                              coupon.redemptions.length >=
                                coupon.redemptionLimit
                              ? "text-red-400"
                              : "",
                          )}
                        >
                          {coupon.redemptions.length}
                          {coupon.redemptionLimit
                            ? ` / ${coupon.redemptionLimit}`
                            : " (Unlimited)"}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell className="text-sm text-gray-400">
                        {intlFormat(new Date(coupon.validFrom), {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableBodyCell>

                      <TableBodyCell className="text-sm text-gray-400">
                        {coupon.validUntil ? (
                          intlFormat(new Date(coupon.validUntil), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        ) : (
                          <span className="text-gray-500 italic">
                            No expiry
                          </span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
                            coupon.active
                              ? "bg-green-900/30 text-green-400 ring-1 ring-green-500/50 ring-inset"
                              : "bg-red-900/30 text-red-400 ring-1 ring-red-500/50 ring-inset",
                          )}
                        >
                          {coupon.active ? "Active" : "Inactive"}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell>
                        <div className="flex justify-around gap-2">
                          <button
                            className="cursor-pointer text-gray-400 hover:text-gray-300"
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code);
                              setCopiedCouponId(coupon.id);

                              setTimeout(() => {
                                setCopiedCouponId(null);
                              }, 2000);

                              toast.success(
                                `Copied coupon code ${coupon.code} to clipboard!`,
                              );
                            }}
                          >
                            {copiedCouponId === coupon.id ? (
                              <ClipboardCheckIcon className="h-4 w-4" />
                            ) : (
                              <ClipboardCopyIcon className="h-4 w-4" />
                            )}

                            <span className="sr-only">
                              Copy coupon code {coupon.code}
                            </span>
                          </button>
                          <Link
                            className="text-blue-600 hover:text-blue-500"
                            to="/admin/coupons/edit/index/$couponId"
                            params={{ couponId: coupon.id }}
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span className="sr-only">
                              Edit coupon {coupon.code}
                            </span>
                          </Link>
                          <button
                            className="cursor-pointer text-red-600 hover:text-red-500"
                            onClick={() => {
                              if (
                                !confirm(
                                  `Are you sure you want to delete the coupon ${coupon.code}? This action cannot be undone.`,
                                )
                              ) {
                                return;
                              }

                              const toastId = toast.loading(
                                `Deleting coupon ${coupon.code}...`,
                              );

                              try {
                                CouponsCollection.delete(coupon.id);

                                toast.success(
                                  `Coupon ${coupon.code} deleted successfully.`,
                                  { id: toastId },
                                );
                              } catch (error) {
                                console.error("Error deleting coupon:", error);

                                toast.error(
                                  `An error occurred while deleting the coupon ${coupon.code}. Please try again.`,
                                  { id: toastId },
                                );
                              }
                            }}
                          >
                            <Trash2Icon className="h-4 w-4" />
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
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-800 p-4">
            <svg
              className="h-12 w-12 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 14l6-6m-5-4h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-8a2 2 0 012-2z"
              />
            </svg>
          </div>

          <div>
            <p className="mt-4 text-lg text-gray-400">No coupons found</p>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating a new coupon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
