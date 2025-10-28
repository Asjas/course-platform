import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/admin/courses/instructor-notes",
)({
  component: AdminInstructorNotesPage,
});

function AdminInstructorNotesPage() {
  return <div>Hello "/_authenticated/admin/courses/instructor-notes"!</div>;
}
