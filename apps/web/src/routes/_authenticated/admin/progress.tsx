import { createFileRoute } from "@tanstack/react-router";
import { CourseProgressAdminCollection } from "~/collections/course-progress";
import { AdminProgressPage } from "~/components/admin-progress-page";

export const Route = createFileRoute("/_authenticated/admin/progress")({
  loader: async () => {
    await CourseProgressAdminCollection.preload();
  },
  component: AdminProgressPage,
});
