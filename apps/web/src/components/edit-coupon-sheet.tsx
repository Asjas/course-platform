import { useForm } from "@tanstack/react-form";
import { ChevronDownIcon } from "lucide-react";
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
import { CouponsCollection } from "~/lib/db.collections";
import { cn } from "~/lib/utils";
import {
  type EditCouponFormData,
  editCouponSchema,
} from "~/schema/edit-coupon";

interface CouponData {
  id: string;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  redemptionLimit: number | null;
  validFrom: Date;
  validUntil: Date | null;
  active: boolean;
  courseId: string | null;
  redemptions: unknown[];
}

interface EditCouponSheetProps {
  coupon: CouponData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCouponSheet({
  coupon,
  open,
  onOpenChange,
}: EditCouponSheetProps) {
  const form = useForm({
    defaultValues: {
      id: coupon?.id ?? "",
      active: coupon?.active ?? true,
      code: coupon?.code ?? "",
      courseId: coupon?.courseId ?? null,
      description: coupon?.description ?? null,
      discountType: coupon?.discountType ?? "percentage",
      discountValue: coupon?.discountValue ?? 0,
      redemptionLimit: coupon?.redemptionLimit ?? null,
      validFrom: coupon ? new Date(coupon.validFrom) : new Date(),
      validUntil: coupon?.validUntil ? new Date(coupon.validUntil) : null,
    } as EditCouponFormData,
    validators: {
      onSubmit: editCouponSchema,
      onBlur: editCouponSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading(`Updating coupon ${value.code}...`);

      try {
        CouponsCollection.update(value.id, (draft) => {
          draft.active = value.active;
          draft.code = value.code;
          draft.courseId = value.courseId;
          draft.description = value.description;
          draft.discountType = value.discountType;
          draft.discountValue = value.discountValue;
          draft.redemptionLimit = value.redemptionLimit ?? 0;
          draft.validFrom = value.validFrom;
          draft.validUntil = value.validUntil;
        });

        toast.success(`Coupon ${value.code} updated successfully!`, {
          id: toastId,
        });

        onOpenChange(false);
      } catch (error) {
        console.error("updateCoupon error", error);
        toast.error("Failed to update coupon. Please try again.", {
          id: toastId,
        });
      }
    },
  });

  const resetFormWithCoupon = useCallback(
    (couponData: CouponData | null) => {
      form.reset({
        id: couponData?.id ?? "",
        active: couponData?.active ?? true,
        code: couponData?.code ?? "",
        courseId: couponData?.courseId ?? null,
        description: couponData?.description ?? null,
        discountType: couponData?.discountType ?? "percentage",
        discountValue: couponData?.discountValue ?? 0,
        redemptionLimit: couponData?.redemptionLimit ?? null,
        validFrom: couponData ? new Date(couponData.validFrom) : new Date(),
        validUntil: couponData?.validUntil
          ? new Date(couponData.validUntil)
          : null,
      });
    },
    [form],
  );

  useEffect(() => {
    if (coupon && open) {
      resetFormWithCoupon(coupon);
    }
  }, [coupon, open, resetFormWithCoupon]);

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
        className="w-full overflow-y-auto sm:max-w-lg"
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="text-xl">Edit Coupon</SheetTitle>
          <SheetDescription>
            Update the coupon details below. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col gap-6 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
        >
          {/* Active Toggle */}
          <form.Field
            name="active"
            children={(field) => (
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor={field.name}
                >
                  Active
                </label>
                <button
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none",
                    field.state.value ? "bg-green-600" : "bg-gray-500",
                  )}
                  id={field.name}
                  type="button"
                  role="switch"
                  aria-checked={field.state.value}
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
                  Code <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
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
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2">
                  <select
                    className="block w-full appearance-none rounded-md bg-gray-800 py-1.5 pr-10 pl-3 text-base text-white outline-1 -outline-offset-1 outline-gray-600 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value as "percentage" | "fixed",
                      )
                    }
                    onBlur={field.handleBlur}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
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
                      <span className="text-red-500">*</span>
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
                  <span className="text-gray-500">
                    (leave empty for unlimited)
                  </span>
                </label>
                <div className="mt-2">
                  <input
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-green-500"
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={0}
                    value={field.state.value ?? ""}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value ? Number(event.target.value) : null,
                      )
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
                  Valid From <span className="text-red-500">*</span>
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
                <div className="relative mt-2">
                  <select
                    className="block w-full appearance-none rounded-md bg-gray-800 py-1.5 pr-10 pl-3 text-base text-white outline-1 -outline-offset-1 outline-gray-600 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onChange={(event) =>
                      field.handleChange(event.target.value || null)
                    }
                    onBlur={field.handleBlur}
                  >
                    <option value="">All courses</option>
                    {/* Add courses here if needed */}
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          {/* Form Actions */}
          <div className="mt-4 flex gap-3">
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
                    {isSubmitting ? "Saving..." : "Save Changes"}
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
