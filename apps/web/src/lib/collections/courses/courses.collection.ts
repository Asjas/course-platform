/**
 * Courses Collection
 *
 * Offline-first collection for courses data.
 * Supports both user-facing (published) and admin views.
 */
import type {
  AllCourses,
  AllCoursesAsAdmin,
  CourseById,
} from "@apps/server/src/routers/courses/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

// Course type that supports both list (getAllCourses) and detail (getCourseById) data
// The collection starts with getAllCourses data, but may be updated with getCourseById data
// which includes modules with nested lessons
type CourseFromList = AllCourses[number];

// Type for user-facing course detail with full structure (modules + lessons)
export type CourseWithModulesAndLessons = NonNullable<CourseById>;

// Union type to support both shapes - the collection may contain either
type Course = CourseFromList | CourseWithModulesAndLessons;

// Type for admin queries that always return full course details
export type AdminCourseDetail = AllCoursesAsAdmin[number];

/**
 * User-facing courses collection.
 * Read-only - courses are managed by admins.
 */
export const CoursesCollection = createCollection(
  queryCollectionOptions<Course>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.courses.getAll.queryKey(),
    queryFn: () => trpcClient.courses.getAll.query(),
  }),
);

/**
 * Admin collection with full CRUD operations.
 * Includes all courses regardless of publish status.
 */
export const CoursesAdminCollection = createCollection(
  queryCollectionOptions<AdminCourseDetail>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: ["admin", "courses"],
    queryFn: () => trpcClient.courses.getAllAsAdmin.query(),
    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0];

      await trpcClient.courses.deleteCourse.mutate({
        courseId: original.id,
      });
    },
  }),
);

/**
 * Course progress collection.
 * Stores progress data per course for the current user.
 */
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

/**
 * Lesson progress collection.
 * Stores progress data per lesson for the current user.
 */
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
