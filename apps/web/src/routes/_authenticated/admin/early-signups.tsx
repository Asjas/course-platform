import { createFileRoute } from "@tanstack/react-router";
import { EarlySignupsCollection } from "~/collections/early-signups";
import { AdminEarlySignupsPage } from "~/components/admin-early-signups-page";

export const Route = createFileRoute("/_authenticated/admin/early-signups")({
  loader: async () => {
    await EarlySignupsCollection.preload();
  },
  component: AdminEarlySignupsPage,
});
