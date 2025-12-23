import type { CouponsReturnType } from "@apps/server/src/routers/coupons/queries";
import type {
  AllCourses,
  CourseById,
} from "@apps/server/src/routers/courses/queries";
import type { AllSupportTickets } from "@apps/server/src/routers/support-tickets/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection, eq, useLiveQuery } from "@tanstack/react-db";
import { toast } from "sonner";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

type SupportTicket = AllSupportTickets[number];
type Coupon = CouponsReturnType[number];

// Course type that supports both list (getAllCourses) and detail (getCourseById) data
// The collection starts with getAllCourses data, but may be updated with getCourseById data
// which includes modules with nested lessons
type CourseFromList = AllCourses[number];
type CourseWithDetails = NonNullable<CourseById>;

// Union type to support both shapes - the collection may contain either
type Course = CourseFromList | CourseWithDetails;

// Export the detailed type for components that need the full structure
export type { CourseWithDetails };

export const SupportTicketsCollection = createCollection(
  queryCollectionOptions<SupportTicket>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.supportTickets.getAllSupportTickets.queryKey(),
    queryFn: () => trpcClient.supportTickets.getAllSupportTickets.query(),
    onInsert: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.supportTickets.createSupportTicket.mutate(modified);
      } catch (error) {
        console.error("Error inserting support ticket: ", error);
        toast.error(
          "An error occurred while creating the support ticket. Please try again.",
        );
        throw error;
      }
    },
    onDelete: async ({ transaction }) => {
      try {
        const { original } = transaction.mutations[0];

        // @ts-ignore Property 'deleteSupportTicket' does not exist
        await trpcClient.supportTickets.deleteSupportTicket.mutate({
          ticketId: original.id,
        });
      } catch (error) {
        console.error("Error deleting support ticket: ", error);
        toast.error(
          "An error occurred while deleting the support ticket. Please try again.",
        );
        throw error;
      }
    },
  }),
);

export const CouponsCollection = createCollection(
  queryCollectionOptions<Coupon>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.coupons.getAllCoupons.queryKey(),
    queryFn: () => trpcClient.coupons.getAllCoupons.query(),
    onInsert: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.coupons.insertCoupon.mutate(modified);
      } catch (error) {
        console.error("Error inserting coupon: ", error);
        toast.error(
          "An error occurred while creating the coupon. Please try again.",
        );
        throw error;
      }
    },
    onUpdate: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.coupons.updateCouponById.mutate({
          id: modified.id,
          active: modified.active,
          code: modified.code,
          courseId: modified.courseId,
          description: modified.description,
          discountType: modified.discountType,
          discountValue: modified.discountValue,
          maxRedemptions: modified.redemptionLimit,
          validFrom: new Date(modified.validFrom),
          validTo: modified.validUntil ? new Date(modified.validUntil) : null,
        });
      } catch (error) {
        console.error("Error updating coupon: ", error);
        toast.error(
          "An error occurred while updating the coupon. Please try again.",
        );
        throw error;
      }
    },
    onDelete: async ({ transaction }) => {
      try {
        const { original } = transaction.mutations[0];

        await trpcClient.coupons.deleteCouponById.mutate({
          couponId: original.id,
        });
      } catch (error) {
        console.error("Error deleting coupon: ", error);
        toast.error(
          "An error occurred while deleting the coupon. Please try again.",
        );
        throw error;
      }
    },
  }),
);

export function useSupportTickets() {
  return useLiveQuery(SupportTicketsCollection);
}

export function useSupportTicketById({ ticketId }: { ticketId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ supportTicket: SupportTicketsCollection })
        .where(({ supportTicket }) => eq(supportTicket.id, ticketId))
        .findOne();
    },
    [ticketId],
  );
}

export function useCoupons() {
  return useLiveQuery(CouponsCollection);
}

export function useCouponById({ couponId }: { couponId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ coupon: CouponsCollection })
        .where(({ coupon }) => eq(coupon.id, couponId))
        .findOne();
    },
    [couponId],
  );
}

export const CoursesCollection = createCollection(
  queryCollectionOptions<Course>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.courses.getAll.queryKey(),
    queryFn: () => trpcClient.courses.getAll.query(),
  }),
);

export const CourseProgressCollection = createCollection(
  queryCollectionOptions<{ id: string }>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: ["courseProgress"],
    queryFn: async () => {
      // This will be empty initially and populated per course
      return [];
    },
  }),
);

export const LessonProgressCollection = createCollection(
  queryCollectionOptions<{ id: string }>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: ["lessonProgress"],
    queryFn: async () => {
      // This will be empty initially and populated per lesson
      return [];
    },
  }),
);

export function useCourses() {
  return useLiveQuery(CoursesCollection);
}

export function useCourseById({ courseId }: { courseId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ course: CoursesCollection })
        .where(({ course }) => eq(course.id, courseId))
        .findOne();
    },
    [courseId],
  );
}
