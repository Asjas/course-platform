import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import * as z from "zod";

const fallback = "/dashboard" as const;

export const Route = createFileRoute("/(auth)")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: async ({ context, search }) => {
    const { session } = context;

    if (session) {
      throw redirect({
        to: search.redirect || fallback,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
