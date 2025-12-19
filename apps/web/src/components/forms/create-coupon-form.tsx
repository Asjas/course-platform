import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";
import BlockerComponent from "~/components/blocker";
import FieldInfo from "~/components/field-info";
import { queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";
import { createCouponSchema } from "~/schema/create-coupon";

export default function CreateCouponForm() {
  const navigate = useNavigate();
  const createCouponMutation = useMutation(
    trpc.coupons.insertCoupon.mutationOptions(),
  );

  const form = useForm({
    defaultValues: {
      code: "",
      discountType: "percentage",
      description: "",
      discountValue: 0,
      redemptionLimit: 0,
      validFrom: new Date(),
      validUntil: null,
      active: true,
      courseId: null,
    } as z.infer<typeof createCouponSchema>,
    validators: {
      onSubmit: createCouponSchema,
      onBlur: createCouponSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const newCoupon = await createCouponMutation.mutateAsync(value);

        queryClient.invalidateQueries({
          queryKey: trpc.coupons.getAllCoupons.queryKey(),
        });

        form.reset();
        toast.success(`Coupon ${newCoupon.code} created successfully!`);

        await new Promise((resolve) => setTimeout(resolve, 300));

        navigate({ to: "/admin/coupons" });
      } catch (error) {
        console.error("createCoupon error", error);
        toast.error("Failed to create coupon. Please try again.");
      }
    },
  });

  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      <form.Subscribe
        selector={(state) => [state.isDirty]}
        children={([isDirty]) => <BlockerComponent formIsDirty={isDirty} />}
      />

      <div className="flex">
        <div className="flex w-full flex-col justify-between">
          <form.Subscribe
            selector={(state) => [state.isDirty, state.isSubmitting]}
            children={([isDirty, isSubmitting]) => (
              <div className="flex gap-2">
                <button
                  className={cn(
                    "h-10 cursor-pointer rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
                    isDirty
                      ? "hover:bg-green-700 active:bg-green-800"
                      : "cursor-not-allowed opacity-50",
                  )}
                  type="submit"
                  disabled={!isDirty}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
                <button
                  className={cn(
                    "h-10 cursor-pointer rounded-md px-3 py-2 text-sm/6 font-semibold text-gray-900 dark:text-white",
                    isDirty
                      ? "hover:bg-gray-200 dark:hover:bg-gray-700"
                      : "cursor-not-allowed opacity-50",
                  )}
                  type="reset"
                  disabled={!isDirty}
                  onClick={(event) => {
                    event.preventDefault();
                    form.reset();
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-6">
        <div className="w-full lg:pb-12">
          <div className="mt-10 flex flex-col gap-x-6 gap-y-8">
            {/* Code Field */}
            <form.Field
              name="code"
              children={(field) => {
                return (
                  <div className="col-span-3">
                    <label
                      className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                      htmlFor={field.name}
                    >
                      Code (Required)
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                        id={field.name}
                        name={field.name}
                        type="text"
                        autoComplete="name"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                );
              }}
            />

            {/* Description Field */}
            <form.Field
              name="description"
              children={(field) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor={field.name}
                  >
                    Description
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-indigo-500">
                      <input
                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-transparent dark:text-white dark:placeholder:text-gray-500"
                        id={field.name}
                        name={field.name}
                        type="text"
                        value={field.state.value ?? ""}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                </div>
              )}
            />

            {/* Discount Type Field */}
            <form.Field
              name="discountType"
              children={(field) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor={field.name}
                  >
                    Discount Type (Required)
                  </label>
                  <div className="mt-2">
                    <select
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
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
                    <FieldInfo field={field} />
                  </div>
                </div>
              )}
            />

            {/* Discount Value Field */}
            <form.Field
              name="discountValue"
              children={(field) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor={field.name}
                  >
                    Discount Value (Required)
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-indigo-500">
                      <input
                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-transparent dark:text-white dark:placeholder:text-gray-500"
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={field.state.value ?? ""}
                        onChange={(event) =>
                          field.handleChange(Number(event.target.value))
                        }
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                </div>
              )}
            />

            {/* Course Selection Field */}
            <form.Field
              name="courseId"
              children={(field) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor={field.name}
                  >
                    Course
                  </label>
                  <div className="mt-2">
                    <select
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onChange={(event) =>
                        field.handleChange(event.target.value || null)
                      }
                    >
                      <option value="">Select a course</option>
                      {/* {courses.map((course) => (
                        <option
                          key={course.id}
                          value={course.id}
                        >
                          {course.name}
                        </option>
                      ))} */}
                    </select>
                  </div>
                </div>
              )}
            />

            {/* Redemption Limit Field */}
            <form.Field
              name="redemptionLimit"
              children={(field) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor={field.name}
                  >
                    Redemption Limit
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-indigo-500">
                      <input
                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-transparent dark:text-white dark:placeholder:text-gray-500"
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={field.state.value ?? ""}
                        onChange={(event) =>
                          field.handleChange(Number(event.target.value))
                        }
                        onBlur={field.handleBlur}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                </div>
              )}
            />

            {/* Valid until Field */}
            <form.Field
              name="validUntil"
              children={(field) => (
                <div className="sm:col-span-4">
                  <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    htmlFor={field.name}
                  >
                    Valid Until
                  </label>
                  <div className="mt-2">
                    <input
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
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
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
