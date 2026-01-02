/**
 * Courses Collection
 *
 * Re-exports collection and hooks for courses.
 */

export {
  CoursesCollection,
  CoursesAdminCollection,
  CourseProgressCollection,
  LessonProgressCollection,
  type CourseWithModulesAndLessons,
  type AdminCourseDetail,
} from "./courses.collection";

export { useCourses, useCoursesAdmin, useCourseById } from "./hooks";
