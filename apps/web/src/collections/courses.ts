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

export const CoursesCollection = createCollection(
  queryCollectionOptions<Course>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.courses.getAll.queryKey(),
    queryFn: () => trpcClient.courses.getAll.query(),
  }),
);

// Admin collection with full CRUD operations
export const CoursesAdminCollection = createCollection(
  queryCollectionOptions<AdminCourseDetail>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: ["admin", "courses"],
    queryFn: () => trpcClient.courses.getAllAsAdmin.query(),
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
