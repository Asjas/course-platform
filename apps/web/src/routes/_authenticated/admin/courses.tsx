import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: AdminCoursesPage,
});

function AdminCoursesPage() {
  return <div>Hello "/_authenticated/admin/courses"!</div>;
}
