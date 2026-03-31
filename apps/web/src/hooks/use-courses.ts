import { eq, useLiveQuery } from "@tanstack/react-db";
import {
  CoursesAdminCollection,
  CoursesCollection,
} from "~/collections/courses";

export function useCourses() {
  return useLiveQuery(CoursesCollection);
}

export function useCoursesAdmin() {
  return useLiveQuery(CoursesAdminCollection);
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
