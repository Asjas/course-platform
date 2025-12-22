import { SelectInput } from "@packages/shared-ui/components/select-input";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
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
import { queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";
import { createCouponSchema } from "~/schema/create-coupon";

interface CreateCouponSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCouponSheet({
  open,
  onOpenChange,
}: CreateCouponSheetProps) {
  const createCouponMutation = useMutation(
    trpc.coupons.insertCoupon.mutationOptions(),
  );

  const form = useForm({
    defaultValues: {
      active: true,
      code: "",
      courseId: null as string | null,
      description: null as string | null,
      discountType: "percentage" as "percentage" | "fixed",
      discountValue: 0,
      redemptionLimit: 0,
      validFrom: new Date(),
      validUntil: null as Date | null,
    },
    validators: {
      onSubmit: createCouponSchema,
      onBlur: createCouponSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading(`Creating coupon ${value.code}...`);

      try {
        const newCoupon = await createCouponMutation.mutateAsync(value);

        queryClient.invalidateQueries({
          queryKey: trpc.coupons.getAllCoupons.queryKey(),
        });

        toast.success(`Coupon ${newCoupon.code} created successfully!`, {
          id: toastId,
        });

        form.reset();
        onOpenChange(false);
      } catch (error) {
        console.error("createCoupon error", error);
        toast.error("Failed to create coupon. Please try again.", {
          id: toastId,
        });
      }
    },
  });

  const resetForm = useCallback(() => {
    form.reset({
      active: true,
      code: "",
      courseId: null,
      description: null,
      discountType: "percentage",
      discountValue: 0,
      redemptionLimit: 0,
      validFrom: new Date(),
      validUntil: null,
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
          <SheetTitle className="text-xl">Create Coupon</SheetTitle>
          <SheetDescription>
            Fill in the coupon details below. Click create when you&apos;re
            done.
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
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-6">
              {/* Active Toggle */}
              <form.Field
                name="active"
                children={(field) => (
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-medium text-gray-900 dark:text-white"
                      id={`${field.name}-label`}
                    >
                      Active
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

              {/* Code Field */}
              <form.Field
                name="code"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Code <span className="text-red-400">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="SUMMER2024"
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

              {/* Description Field */}
              <form.Field
                name="description"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Description
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="Summer sale discount"
                        value={field.state.value ?? ""}
                        onChange={(event) =>
                          field.handleChange(event.target.value || null)
                        }
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Discount Type Field */}
              <form.Field
                name="discountType"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Discount Type <span className="text-red-400">*</span>
                    </label>
                    <div className="mt-2">
                      <SelectInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value as "percentage" | "fixed",
                          )
                        }
                        onBlur={field.handleBlur}
                        aria-required="true"
                        options={[
                          { value: "percentage", label: "Percentage" },
                          { value: "fixed", label: "Fixed Amount" },
                        ]}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Discount Value Field */}
              <form.Field
                name="discountValue"
                children={(field) => (
                  <div>
                    <form.Subscribe
                      selector={(state) => state.values.discountType}
                      children={(discountType) => (
                        <label
                          className="block text-sm font-medium text-gray-900 dark:text-white"
                          htmlFor={field.name}
                        >
                          Discount Value (
                          {discountType === "percentage" ? "%" : "$"}){" "}
                          <span className="text-red-400">*</span>
                        </label>
                      )}
                    />
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        placeholder="10"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(Number(event.target.value))
                        }
                        onBlur={field.handleBlur}
                        aria-required="true"
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Redemption Limit Field */}
              <form.Field
                name="redemptionLimit"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Redemption Limit{" "}
                      <span className="text-gray-500">(0 for unlimited)</span>
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        placeholder="0"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(Number(event.target.value))
                        }
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Valid From Field */}
              <form.Field
                name="validFrom"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Valid From <span className="text-red-400">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                        id={field.name}
                        name={field.name}
                        type="date"
                        value={
                          field.state.value
                            ? new Date(field.state.value)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(event) => {
                          const dateValue = event.target.value
                            ? new Date(event.target.value)
                            : new Date();
                          field.handleChange(dateValue);
                        }}
                        onBlur={field.handleBlur}
                        aria-required="true"
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Valid Until Field */}
              <form.Field
                name="validUntil"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Valid Until{" "}
                      <span className="text-gray-500">
                        (leave empty for no expiry)
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                        id={field.name}
                        name={field.name}
                        type="date"
                        value={
                          field.state.value
                            ? new Date(field.state.value)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(event) => {
                          const dateValue = event.target.value
                            ? new Date(event.target.value)
                            : null;
                          field.handleChange(dateValue);
                        }}
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Course Selection Field */}
              <form.Field
                name="courseId"
                children={(field) => (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Course{" "}
                      <span className="text-gray-500">
                        (leave empty for all courses)
                      </span>
                    </label>
                    <div className="mt-2">
                      <SelectInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onChange={(event) =>
                          field.handleChange(event.target.value || null)
                        }
                        onBlur={field.handleBlur}
                        placeholder="All courses"
                        options={
                          [
                            // Add courses here if needed
                          ]
                        }
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Form Actions - Fixed Footer */}
          <div className="flex gap-3 border-t border-gray-700 p-4">
            <form.Subscribe
              selector={(state) => [state.isDirty, state.isSubmitting]}
              children={([isDirty, isSubmitting]) => (
                <>
                  <button
                    className={cn(
                      "flex-1 cursor-pointer rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
                      isDirty
                        ? "hover:bg-green-700 active:bg-green-800"
                        : "cursor-not-allowed opacity-50",
                    )}
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Coupon"}
                  </button>
                  <button
                    className="flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-100 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-800"
                    type="button"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                </>
              )}
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
