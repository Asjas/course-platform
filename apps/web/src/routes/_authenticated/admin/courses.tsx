import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: AdminCoursesComponent,
});

function AdminCoursesComponent() {
  return <div>Hello "/_authenticated/admin/courses"!</div>;
}
