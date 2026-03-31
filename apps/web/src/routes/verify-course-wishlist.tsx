import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  buildCourseWishlistVerifyUrl,
  getVerificationStatusConfig,
  resolveVerificationStatus,
  verificationSearchSchema,
} from "~/lib/verify-course-wishlist";

export const Route = createFileRoute("/verify-course-wishlist")({
  validateSearch: verificationSearchSchema,
  component: VerifyCourseWishlistPage,
});

function VerifyCourseWishlistPage() {
  const { status, token } = Route.useSearch();
  const resolvedStatus = resolveVerificationStatus(status);
  const config = getVerificationStatusConfig(resolvedStatus);

  useEffect(() => {
    if (!token || status) {
      return;
    }

    window.location.replace(
      buildCourseWishlistVerifyUrl(import.meta.env.VITE_TRPC_URL, token),
    );
  }, [status, token]);

  if (token && !status) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16">
        <section className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-900 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <h1 className="text-2xl font-semibold md:text-3xl">
            Verifying your email...
          </h1>
          <p className="mt-3 text-base leading-relaxed opacity-90 md:text-lg">
            Please wait while we confirm your waitlist signup.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16">
      <section
        className={`w-full rounded-2xl border p-8 shadow-sm md:p-10 ${config.cardClass}`}
      >
        <h1 className="text-2xl font-semibold md:text-3xl">{config.title}</h1>
        <p className="mt-3 text-base leading-relaxed opacity-90 md:text-lg">
          {config.description}
        </p>
      </section>
    </main>
  );
}
