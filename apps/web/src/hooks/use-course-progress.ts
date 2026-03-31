import { useLiveQuery } from "@tanstack/react-db";
import { CourseProgressAdminCollection } from "~/collections/course-progress";

export function useCourseProgressAdmin() {
  return useLiveQuery(CourseProgressAdminCollection);
}
