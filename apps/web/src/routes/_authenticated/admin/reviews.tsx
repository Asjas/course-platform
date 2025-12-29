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
import { EmptyState } from "~/components/empty-state";
import Loading from "~/components/loading";
import ReviewDetailsSheet from "~/components/review-details-sheet";
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
} from "~/components/ui/table";
import { ReviewsCollection, useReviews } from "~/lib/db.collections";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  loader: async () => {
    await ReviewsCollection.preload();
  },
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const { data: reviews, isLoading } = useReviews();
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  function handleViewReview(reviewId: string) {
    setSelectedReviewId(reviewId);
    setIsDetailsSheetOpen(true);
  }

  function handleDetailsSheetOpenChange(open: boolean) {
    setIsDetailsSheetOpen(open);
    if (!open) {
      setSelectedReviewId(null);
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
            Course Reviews
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage and moderate course reviews. Review, approve, edit, or delete
            user feedback.
          </p>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="mt-12 flow-root">
          <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Course</TableHeaderCell>
                    <TableHeaderCell>Rating</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Created At</TableHeaderCell>
                    <TableHeaderCell>
                      <span className="sr-only">Table Actions</span>
                    </TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>

                <TableBody>
                  {reviews.map((review) => (
                    <TableBodyRow key={review.id}>
                      <TableBodyCell className="font-medium">
                        {review.user?.name || "Unknown User"}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {review.course?.name || "Unknown Course"}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{review.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {review.title}
                      </TableBodyCell>

                      <TableBodyCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
                            review.approved
                              ? "bg-green-100 text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500/50 ring-inset dark:bg-yellow-900/30 dark:text-yellow-400",
                          )}
                        >
                          {review.approved ? (
                            <>
                              <CheckCircle2Icon className="mr-1 h-3 w-3" />
                              Approved
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="mr-1 h-3 w-3" />
                              Pending
                            </>
                          )}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                        {intlFormat(new Date(review.createdAt), {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableBodyCell>

                      <TableBodyCell>
                        <div className="flex justify-around gap-2">
                          <button
                            className="cursor-pointer text-blue-400 hover:text-blue-300"
                            type="button"
                            onClick={() => handleViewReview(review.id)}
                          >
                            <EyeIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">View review details</span>
                          </button>
                          <button
                            className="cursor-pointer text-red-400 hover:text-red-300"
                            onClick={async () => {
                              if (
                                !confirm(
                                  `Are you sure you want to delete this review by ${review.user?.name || "Unknown User"}? This action cannot be undone.`,
                                )
                              ) {
                                return;
                              }

                              const toastId =
                                toast.loading("Deleting review...");

                              try {
                                await ReviewsCollection.delete(review.id);

                                toast.success("Review deleted successfully.", {
                                  id: toastId,
                                });
                              } catch (error) {
                                console.error("Error deleting review:", error);

                                toast.error(
                                  "An error occurred while deleting the review. Please try again.",
                                  { id: toastId },
                                );
                              }
                            }}
                          >
                            <Trash2Icon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">Delete review</span>
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
          title="No reviews found"
          description="There are no course reviews to display."
        />
      )}

      <ReviewDetailsSheet
        reviewId={selectedReviewId}
        open={isDetailsSheetOpen}
        onOpenChange={handleDetailsSheetOpenChange}
      />
    </div>
  );
}
