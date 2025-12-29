import { SelectInput } from "@packages/shared-ui/components/select-input";
import { useForm } from "@tanstack/react-form";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLinkIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import FieldInfo from "~/components/field-info";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { authClient } from "~/lib/auth.client";
import { ReviewsCollection } from "~/lib/db.collections";
import { trpc, trpcClient } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";
import { createReviewSchema } from "~/schema/create-review";

interface CreateReviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateReviewSheet({
  open,
  onOpenChange,
}: CreateReviewSheetProps) {
  // Fetch users and courses for selection
  const { data: usersResponse } = useSuspenseQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const result = await authClient.admin.listUsers({
        query: { sortBy: "name", sortDirection: "asc" },
      });
      return result.data?.users || [];
    },
  });

  const { data: courses } = useSuspenseQuery(
    trpc.courses.getAllCoursesAsAdmin.queryOptions(),
  );

  const createReviewMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      courseId: string;
      rating: number | null;
      title: string;
      comment: string;
      externalLink: string | null;
      approved: boolean;
    }) => {
      return trpcClient.reviews.createAdminReview.mutate(data);
    },
  });

  const form = useForm({
    defaultValues: {
      userId: "",
      courseId: "",
      rating: null as number | null,
      title: "",
      comment: "",
      externalLink: "",
      approved: true,
    },
    validators: {
      onSubmit: createReviewSchema,
      onBlur: createReviewSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Creating review...");

      try {
        await createReviewMutation.mutateAsync({
          userId: value.userId,
          courseId: value.courseId,
          rating: value.rating,
          title: value.title,
          comment: value.comment,
          externalLink: value.externalLink || null,
          approved: value.approved,
        });

        // Invalidate the reviews collection
        await ReviewsCollection.preload();

        toast.success("Review created successfully!", {
          id: toastId,
        });

        form.reset();
        onOpenChange(false);
      } catch (error) {
        console.error("createReview error", error);
        const errorMessage =
          error instanceof Error && error.message.includes("already reviewed")
            ? "This user has already reviewed this course."
            : "Failed to create review. Please try again.";
        toast.error(errorMessage, {
          id: toastId,
        });
      }
    },
  });

  const resetForm = useCallback(() => {
    form.reset({
      userId: "",
      courseId: "",
      rating: null,
      title: "",
      comment: "",
      externalLink: "",
      approved: true,
    });
  }, [form]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  const users = usersResponse || [];

  // Pre-compute options arrays outside JSX for performance
  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.name || user.email,
  }));

  const courseOptions = courses.map((course) => ({
    value: course.id,
    label: course.name,
  }));

  const ratingOptions = [
    { value: "5", label: "5 Stars ★★★★★" },
    { value: "4", label: "4 Stars ★★★★☆" },
    { value: "3", label: "3 Stars ★★★☆☆" },
    { value: "2", label: "2 Stars ★★☆☆☆" },
    { value: "1", label: "1 Star ★☆☆☆☆" },
  ];

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
        className="flex w-full flex-col sm:max-w-lg"
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="text-xl">Create Review</SheetTitle>
          <SheetDescription>
            Add a review for a course. Use this for external reviews from social
            media that don&apos;t have a rating.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
        >
          <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-6">
              {/* User Selection */}
              <form.Field
                name="userId"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      User <span className="text-red-400">*</span>
                    </label>
                    <div className="mt-2">
                      <SelectInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        aria-required="true"
                        placeholder="Select a user..."
                        options={userOptions}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Course Selection */}
              <form.Field
                name="courseId"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Course <span className="text-red-400">*</span>
                    </label>
                    <div className="mt-2">
                      <SelectInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        aria-required="true"
                        placeholder="Select a course..."
                        options={courseOptions}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Rating Field (Optional) */}
              <form.Field
                name="rating"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Rating{" "}
                      <span className="text-gray-500">
                        (optional for external reviews)
                      </span>
                    </label>
                    <div className="mt-2">
                      <SelectInput
                        id={field.name}
                        name={field.name}
                        value={
                          field.state.value !== null
                            ? String(field.state.value)
                            : ""
                        }
                        onChange={(event) => {
                          const value = event.target.value;
                          field.handleChange(value ? Number(value) : null);
                        }}
                        onBlur={field.handleBlur}
                        placeholder="No rating"
                        options={ratingOptions}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Title Field */}
              <form.Field
                name="title"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Title <span className="text-red-400">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="Great course!"
                        maxLength={100}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        aria-required="true"
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Comment Field */}
              <form.Field
                name="comment"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Comment <span className="text-red-400">*</span>
                    </label>
                    <div className="mt-2">
                      <textarea
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                        id={field.name}
                        name={field.name}
                        rows={4}
                        placeholder="This course helped me understand..."
                        maxLength={2000}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        aria-required="true"
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* External Link Field */}
              <form.Field
                name="externalLink"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      <span className="flex items-center gap-1">
                        <ExternalLinkIcon className="h-4 w-4" />
                        External Link
                        <span className="text-gray-500">(optional)</span>
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                        id={field.name}
                        name={field.name}
                        type="url"
                        placeholder="https://twitter.com/user/status/123..."
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Link to the original review on social media (Twitter,
                      LinkedIn, etc.)
                    </p>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Approved Toggle */}
              <form.Field
                name="approved"
                children={(field) => (
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-medium text-gray-900 dark:text-white"
                      id={`${field.name}-label`}
                    >
                      Approved
                    </span>
                    <button
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none",
                        field.state.value ? "bg-green-600" : "bg-gray-500",
                      )}
                      id={field.name}
                      type="button"
                      role="switch"
                      aria-checked={field.state.value}
                      aria-labelledby={`${field.name}-label`}
                      onClick={() => field.handleChange(!field.state.value)}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          field.state.value ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Form Actions - Fixed Footer */}
          <div className="flex gap-3 border-t border-gray-700 p-4">
            <form.Subscribe
              selector={(state) => [
                state.values.userId,
                state.values.courseId,
                state.values.title,
                state.values.comment,
                state.isSubmitting,
              ]}
              children={([userId, courseId, title, comment, isSubmitting]) => {
                const isValid = userId && courseId && title && comment;
                return (
                  <>
                    <button
                      className={cn(
                        "flex-1 cursor-pointer rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
                        isValid
                          ? "hover:bg-green-700 active:bg-green-800"
                          : "cursor-not-allowed opacity-50",
                      )}
                      type="submit"
                      disabled={!isValid || (isSubmitting as boolean)}
                    >
                      {isSubmitting ? "Creating..." : "Create Review"}
                    </button>
                    <button
                      className="flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-100 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-800"
                      type="button"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                  </>
                );
              }}
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
