import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { Toaster } from "~/components/ui/sonner";
import { authClient } from "~/lib/auth.client";
import { useAuth } from "~/lib/auth.context";

export default function DefaultLayoutComponent({
  children,
}: {
  children: ReactNode;
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
        <div className="mt-10 flex w-full flex-col md:mt-20">
          {user && !user?.emailVerified ? (
            <div className="flex items-center justify-between bg-green-400 p-4 text-sm text-black">
              Your email is not verified. Please check your inbox for a
              verification email.
              <button
                className="rounded-sm border bg-gray-800 px-2 py-1 text-white"
                type="button"
                onClick={async () => {
                  await authClient.sendVerificationEmail(
                    {
                      email: user.email,
                    },
                    {
                      onSuccess: () => {
                        setEmailResent(true);
                        toast.success("Verification email resent!");
                      },
                      onError: ({ error }) => {
                        setEmailResent(false);
                        toast.error("Failed to resend verification email.");
                        console.error(
                          "Failed to resend verification email: ",
                          error,
                        );
                      },
                    },
                  );
                }}
              >
                {isEmailResent
                  ? "Verification Email Sent!"
                  : "Resend Verification Email"}
              </button>
            </div>
          ) : null}
          {children}
        </div>
        <Footer />
      </div>

      <TanStackDevtools
        config={{ position: "bottom-left" }}
        plugins={[
          { name: "Tanstack Query", render: <ReactQueryDevtoolsPanel /> },
          { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
          { name: "Tanstack Form", render: <FormDevtoolsPanel /> },
        ]}
      />
    </div>
  );
}
