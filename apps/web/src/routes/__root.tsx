import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { Toaster } from "~/components/ui/sonner.tsx";
import { authClient } from "~/lib/auth.client.ts";
import { type AuthState, useAuth } from "~/lib/auth.context";
import { trpc } from "~/lib/trpc.client.ts";

interface MyRouterContext {
  auth: AuthState;
  queryClient: QueryClient;
  trpc: typeof trpc;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootRoute,
});

function RootRoute() {
  const auth = useAuth();
  const user = auth.session?.user;
  const [isEmailResent, setEmailResent] = useState(false);

  console.log("user", user);

  return (
    <>
      <a
        className="sr-only mt-20 focus:not-sr-only focus:inline-flex"
        href="#maincontent"
      >
        Skip to main
      </a>
      <Toaster />
      <div className="grid min-h-screen grid-rows-[1fr_auto]">
        <Header auth={auth} />
        <main
          className="flex flex-col overflow-y-auto pt-20"
          id="maincontent"
        >
          {user && !user?.emailVerified ? (
            <div className="flex items-center justify-between bg-green-400 p-4 text-sm text-black">
              Your email is not verified. Please check your inbox for a
              verification email.
              <button
                className="rounded-sm border bg-gray-800 px-2 py-1 text-white"
                type="button"
                onClick={async () => {
                  await authClient.sendVerificationEmail({ email: user.email });
                  setEmailResent(true);
                }}
              >
                {isEmailResent
                  ? "Verification Email Sent!"
                  : "Resend Verification Email"}
              </button>
            </div>
          ) : null}
          <Outlet />
        </main>
        <Footer />
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </>
  );
}
