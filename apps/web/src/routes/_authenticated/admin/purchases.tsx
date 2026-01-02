import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/shared-ui/components/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { DollarSignIcon, EyeIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "~/components/empty-state";
import Loading from "~/components/loading";
import RefundPurchaseModal from "~/components/refund-purchase-modal";
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
} from "~/components/ui/table";
import ViewPurchaseSheet from "~/components/view-purchase-sheet";
import {
  type Purchase,
  PurchasesCollection,
  usePurchases,
} from "~/lib/collections/purchases";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/purchases")({
  loader: async () => {
    await PurchasesCollection.preload();
  },
  component: AdminPurchasesPage,
});

function AdminPurchasesPage() {
  const { data: purchases, isLoading } = usePurchases();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [refundingPurchase, setRefundingPurchase] = useState<Purchase | null>(
    null,
  );
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  function handleViewPurchase(purchase: Purchase) {
    setViewingPurchase(purchase);
    setIsViewSheetOpen(true);
  }

  function handleViewSheetOpenChange(open: boolean) {
    setIsViewSheetOpen(open);
    if (!open) {
      setViewingPurchase(null);
    }
  }

  function handleRefundClick(purchase: Purchase) {
    setRefundingPurchase(purchase);
    setIsRefundModalOpen(true);
  }

  function handleRefundModalOpenChange(open: boolean) {
    setIsRefundModalOpen(open);
    if (!open) {
      setRefundingPurchase(null);
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  // Filter purchases based on active tab
  const filteredPurchases = purchases.filter((purchase) => {
    if (activeTab === "all") return true;
    if (activeTab === "refunded") return purchase.refundedAmount > 0;
    if (activeTab === "active") return purchase.refundedAmount === 0;
    return true;
  });

  const totalRevenue = purchases
    .filter((p) => p.refundedAmount === 0)
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const totalRefunded = purchases.reduce((sum, p) => sum + p.refundedAmount, 0);

  return (
    <div className="mb-15 flex h-full flex-col">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Purchases
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            View and manage all purchases from Polar. Process refunds and track
            revenue.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <DollarSignIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                ${(totalRevenue / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
              <RefreshCwIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Refunded
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                ${(totalRefunded / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
              <EyeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Orders
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {purchases.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="flex w-fit rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <TabsTrigger
              className="flex-1 cursor-pointer rounded-md px-4 py-2 text-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-400 dark:hover:text-white dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              value="all"
            >
              All ({purchases.length})
            </TabsTrigger>
            <TabsTrigger
              className="flex-1 cursor-pointer rounded-md px-4 py-2 text-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-400 dark:hover:text-white dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              value="active"
            >
              Active ({purchases.filter((p) => p.refundedAmount === 0).length})
            </TabsTrigger>
            <TabsTrigger
              className="flex-1 cursor-pointer rounded-md px-4 py-2 text-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-400 dark:hover:text-white dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              value="refunded"
            >
              Refunded ({purchases.filter((p) => p.refundedAmount > 0).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            className="mt-6"
            value="all"
          >
            <PurchasesTable
              purchases={filteredPurchases}
              onView={handleViewPurchase}
              onRefund={handleRefundClick}
            />
          </TabsContent>

          <TabsContent
            className="mt-6"
            value="active"
          >
            <PurchasesTable
              purchases={filteredPurchases}
              onView={handleViewPurchase}
              onRefund={handleRefundClick}
            />
          </TabsContent>

          <TabsContent
            className="mt-6"
            value="refunded"
          >
            <PurchasesTable
              purchases={filteredPurchases}
              onView={handleViewPurchase}
              onRefund={handleRefundClick}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ViewPurchaseSheet
        purchase={viewingPurchase}
        open={isViewSheetOpen}
        onOpenChange={handleViewSheetOpenChange}
      />

      <RefundPurchaseModal
        purchase={refundingPurchase}
        open={isRefundModalOpen}
        onOpenChange={handleRefundModalOpenChange}
      />
    </div>
  );
}

interface PurchasesTableProps {
  purchases: Purchase[];
  onView: (purchase: Purchase) => void;
  onRefund: (purchase: Purchase) => void;
}

function PurchasesTable({ purchases, onView, onRefund }: PurchasesTableProps) {
  if (purchases.length === 0) {
    return (
      <EmptyState
        title="No purchases found"
        description="Purchases will appear here once customers make orders."
      />
    );
  }

  return (
    <div className="flow-root">
      <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <Table aria-label="Purchases with customer, product, amount, date, status, and actions">
            <TableHeader>
              <TableHeaderRow>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>
                  <span className="sr-only">Table Actions</span>
                </TableHeaderCell>
              </TableHeaderRow>
            </TableHeader>

            <TableBody>
              {purchases.map((purchase) => {
                const isRefunded = purchase.refundedAmount > 0;
                const totalAmount = purchase.totalAmount / 100;

                return (
                  <TableBodyRow key={purchase.id}>
                    <TableBodyCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {purchase.customer.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {purchase.customer.email}
                        </p>
                      </div>
                    </TableBodyCell>

                    <TableBodyCell className="text-gray-900 dark:text-white">
                      {purchase.product?.name ?? "Unknown Product"}
                    </TableBodyCell>

                    <TableBodyCell
                      className={cn(
                        "font-medium",
                        isRefunded
                          ? "text-red-600 line-through dark:text-red-400"
                          : "text-gray-900 dark:text-white",
                      )}
                    >
                      {purchase.currency.toUpperCase()} {totalAmount.toFixed(2)}
                    </TableBodyCell>

                    <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(purchase.createdAt), "MMM d, yyyy")}
                    </TableBodyCell>

                    <TableBodyCell>
                      <div className="flex items-center gap-2">
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
                          {isRefunded
                            ? "Refunded"
                            : purchase.paid
                              ? "Paid"
                              : "Pending"}
                        </span>
                      </div>
                    </TableBodyCell>

                    <TableBodyCell>
                      <div className="flex justify-around gap-2">
                        <button
                          className="cursor-pointer text-blue-400 hover:text-blue-300"
                          type="button"
                          onClick={() => onView(purchase)}
                        >
                          <EyeIcon
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          <span className="sr-only">
                            View purchase for {purchase.customer.email}
                          </span>
                        </button>
                        {!isRefunded && purchase.paid && (
                          <button
                            className="cursor-pointer text-red-400 hover:text-red-300"
                            type="button"
                            onClick={() => onRefund(purchase)}
                          >
                            <RefreshCwIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">
                              Refund purchase for {purchase.customer.email}
                            </span>
                          </button>
                        )}
                      </div>
                    </TableBodyCell>
                  </TableBodyRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
