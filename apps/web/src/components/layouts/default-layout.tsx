import { type ReactNode, Suspense, lazy, useState } from "react";
import { toast } from "sonner";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { Toaster } from "~/components/ui/sonner";
import { authClient } from "~/lib/auth.client";
import { useAuth } from "~/lib/auth.context";

const TanStackDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-devtools").then((m) => ({
        default: m.TanStackDevtools,
      })),
    )
  : () => null;

const ReactQueryDevtoolsPanel = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtoolsPanel,
      })),
    )
  : () => null;

const TanStackRouterDevtoolsPanel = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtoolsPanel,
      })),
    )
  : () => null;

const FormDevtoolsPanel = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-form-devtools").then((m) => ({
        default: m.FormDevtoolsPanel,
      })),
    )
  : () => null;

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
                className="cursor-pointer rounded-sm border bg-gray-800 px-2 py-1 text-white"
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

      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <TanStackDevtools
            config={{ position: "bottom-left" }}
            plugins={[
              {
                name: "Tanstack Query",
                render: (
                  <Suspense fallback={null}>
                    <ReactQueryDevtoolsPanel />
                  </Suspense>
                ),
              },
              {
                name: "Tanstack Router",
                render: (
                  <Suspense fallback={null}>
                    <TanStackRouterDevtoolsPanel />
                  </Suspense>
                ),
              },
              {
                name: "Tanstack Form",
                render: (
                  <Suspense fallback={null}>
                    <FormDevtoolsPanel />
                  </Suspense>
                ),
              },
            ]}
          />
        </Suspense>
      )}
    </div>
  );
}
