import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2Icon, SaveIcon, XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FieldInfo from "~/components/field-info";
import Loading from "~/components/loading";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { ReviewsCollection } from "~/lib/db.collections";
import { trpc, trpcClient } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";
import {
  type EditReviewFormData,
  editReviewSchema,
} from "~/schema/edit-review";

interface ReviewDetailsSheetProps {
  reviewId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReviewDetailsSheet({
  reviewId,
  open,
  onOpenChange,
}: ReviewDetailsSheetProps) {
  const [isApproving, setIsApproving] = useState(false);

  // Fetch extended review details from the server
  const { data: reviewDetails, isLoading } = useQuery({
    ...trpc.reviews.getReviewById.queryOptions({ reviewId: reviewId || "" }),
    enabled: !!reviewId && open,
  });

  const form = useForm({
    defaultValues: {
      title: reviewDetails?.title || "",
      comment: reviewDetails?.comment || "",
    } as EditReviewFormData,
    validators: {
      onBlur: editReviewSchema,
      onSubmit: editReviewSchema,
    },
    onSubmit: async ({ value }) => {
      if (!reviewId) return;

      const toastId = toast.loading("Updating review...");

      try {
        ReviewsCollection.update(reviewId, (draft) => {
          draft.title = value.title;
          draft.comment = value.comment;
        });

        toast.success("Review updated successfully!", { id: toastId });
      } catch (error) {
        console.error("Update review error", error);
        toast.error("Failed to update review. Please try again.", {
          id: toastId,
        });
      }
    },
  });

  // Reset form when review details change
  useEffect(() => {
    if (reviewDetails && open) {
      form.reset({
        title: reviewDetails.title,
        comment: reviewDetails.comment,
      });
    }
  }, [reviewDetails, open, form]);

  async function handleApprove() {
    if (!reviewId) return;

    setIsApproving(true);
    const toastId = toast.loading("Approving review...");

    try {
      await trpcClient.reviews.approveReview.mutate({ reviewId });

      // Update the local collection
      ReviewsCollection.update(reviewId, (draft) => {
        draft.approved = true;
        draft.reviewedAt = new Date();
      });

      toast.success("Review approved successfully!", { id: toastId });
      onOpenChange(false);
    } catch (error) {
      console.error("Approve review error", error);
      toast.error("Failed to approve review. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsApproving(false);
    }
  }

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  if (!reviewId) {
    return null;
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          handleClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <SheetContent
        className="flex w-full flex-col sm:max-w-2xl"
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="text-xl">Review Details</SheetTitle>
          <SheetDescription>
            Review detailed information and moderate this course review.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : reviewDetails ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
              {/* Review Status */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Review Status
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
                      reviewDetails.approved
                        ? "bg-green-100 text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500/50 ring-inset dark:bg-yellow-900/30 dark:text-yellow-400",
                    )}
                  >
                    {reviewDetails.approved ? (
                      <>
                        <CheckCircle2Icon className="mr-1 h-3 w-3" />
                        Approved
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="mr-1 h-3 w-3" />
                        Pending Approval
                      </>
                    )}
                  </span>
                </div>
                {reviewDetails.reviewedAt && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Reviewed on{" "}
                    {new Date(reviewDetails.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* User Information */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  User Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Name:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reviewDetails.user?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Email:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reviewDetails.user?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Open Support Tickets:
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        reviewDetails.openTicketsCount > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400",
                      )}
                    >
                      {reviewDetails.openTicketsCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Course Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Course:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reviewDetails.course?.name || "Unknown"}
                    </span>
                  </div>
                  {reviewDetails.courseProgress && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progress:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {reviewDetails.courseProgress.progress}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Completed:
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            reviewDetails.courseProgress.completed
                              ? "text-green-600 dark:text-green-400"
                              : "text-yellow-600 dark:text-yellow-400",
                          )}
                        >
                          {reviewDetails.courseProgress.completed
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Rating
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reviewDetails.rating}
                  </span>
                  <span className="text-2xl text-yellow-500">★</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    out of 5
                  </span>
                </div>
              </div>

              {/* Edit Review Form */}
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Review Content
                  </h3>

                  <form.Field name="title">
                    {(field) => (
                      <div className="mb-4">
                        <label
                          className="block text-sm font-medium text-gray-900 dark:text-white"
                          htmlFor={field.name}
                        >
                          Title
                        </label>
                        <div className="mt-2">
                          <input
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                            id={field.name}
                            name={field.name}
                            type="text"
                            value={field.state.value}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            onBlur={field.handleBlur}
                          />
                        </div>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="comment">
                    {(field) => (
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-900 dark:text-white"
                          htmlFor={field.name}
                        >
                          Comment
                        </label>
                        <div className="mt-2">
                          <textarea
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                            id={field.name}
                            name={field.name}
                            rows={6}
                            value={field.state.value}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            onBlur={field.handleBlur}
                          />
                        </div>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3">
                  <form.Subscribe
                    selector={(state) => [state.isDirty, state.isSubmitting]}
                    children={([isDirty, isSubmitting]) => (
                      <button
                        className={cn(
                          "flex-1 cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                          isDirty
                            ? "hover:bg-blue-700 active:bg-blue-800"
                            : "cursor-not-allowed opacity-50",
                        )}
                        type="submit"
                        disabled={!isDirty || isSubmitting}
                      >
                        <SaveIcon className="mr-2 inline-block h-4 w-4" />
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                    )}
                  />
                </div>
              </form>
            </div>

            {/* Fixed Footer Actions */}
            <div className="flex gap-3 border-t border-gray-300 p-4 dark:border-gray-700">
              {!reviewDetails.approved && (
                <button
                  className="flex-1 cursor-pointer rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 active:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={handleApprove}
                  disabled={isApproving}
                >
                  <CheckCircle2Icon className="mr-2 inline-block h-4 w-4" />
                  {isApproving ? "Approving..." : "Approve Review"}
                </button>
              )}
              <button
                className="flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-100 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-800"
                type="button"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Review not found or failed to load.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
