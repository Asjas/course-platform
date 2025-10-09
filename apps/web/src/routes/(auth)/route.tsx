import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import * as z from "zod";

const fallback = "/dashboard" as const;

export const Route = createFileRoute("/(auth)")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: async ({ context, search }) => {
    const { auth } = context;

    if (auth.isAuthenticated) {
      throw redirect({
        to: search.redirect || fallback,
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
