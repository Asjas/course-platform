import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/courses/$courseId/lessons",
)({
  component: LessonLayoutRoute,
});

function LessonLayoutRoute() {
  return <Outlet />;
}
