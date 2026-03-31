import { createFileRoute } from "@tanstack/react-router";
import { EnrollmentsAdminCollection } from "~/collections/enrollments";
import { AdminEnrollmentsPage } from "~/components/admin-enrollments-page";

export const Route = createFileRoute("/_authenticated/admin/enrollments")({
  loader: async () => {
    await EnrollmentsAdminCollection.preload();
  },
  component: AdminEnrollmentsPage,
});
