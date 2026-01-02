/**
 * Courses Hooks
 *
 * React hooks for accessing the courses collections.
 */
import {
  CoursesAdminCollection,
  CoursesCollection,
} from "./courses.collection";
import { eq, useLiveQuery } from "@tanstack/react-db";

/**
 * Get all published courses.
 * Uses the offline-first collection.
 */
export function useCourses() {
  return useLiveQuery(CoursesCollection);
}

/**
 * Get all courses as admin.
 * Includes unpublished courses with full details.
 */
export function useCoursesAdmin() {
  return useLiveQuery(CoursesAdminCollection);
}

/**
 * Get a single course by ID.
 * Returns the course from the offline collection.
 */
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
