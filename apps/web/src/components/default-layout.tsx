import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { Toaster } from "~/components/ui/sonner";
import { authClient } from "~/lib/auth.client";
import { useAuth } from "~/lib/auth.context";

export default function DefaultLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const user = auth.session?.user;
  const [isEmailResent, setEmailResent] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        className="sr-only mt-20 focus:not-sr-only focus:inline-flex"
        href="#maincontent"
      >
        Skip to main
      </a>
      <Toaster />
      <div className="grid min-h-screen grid-rows-[1fr_auto]">
        <Header auth={auth} />
        <main className="mt-10 flex w-full flex-col px-6 md:mt-20">
          {user && !user?.emailVerified ? (
            <div className="-mx-6 flex items-center justify-between bg-green-400 p-4 text-sm text-black">
              Your email is not verified. Please check your inbox for a
              verification email.
              <button
                className="rounded-sm border bg-gray-800 px-2 py-1 text-white"
                type="button"
                onClick={async () => {
                  await authClient.sendVerificationEmail({
                    email: user.email,
                  });
                  setEmailResent(true);
                }}
              >
                {isEmailResent
                  ? "Verification Email Sent!"
                  : "Resend Verification Email"}
              </button>
            </div>
          ) : null}
          {children}
        </main>
        <Footer />
      </div>
      <ReactQueryDevtools
        initialIsOpen={false}
        buttonPosition="bottom-left"
      />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
