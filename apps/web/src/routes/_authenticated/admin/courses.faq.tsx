import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/courses/faq")({
  component: AdminCoursesFAQPage,
});

function AdminCoursesFAQPage() {
  return <div>Hello "/_authenticated/admin/courses/faq"!</div>;
}
