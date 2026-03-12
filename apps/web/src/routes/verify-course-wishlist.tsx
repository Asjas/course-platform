import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as z from "zod";

export const verificationSearchSchema = z.object({
  token: z.string().optional(),
  status: z
    .enum(["verified", "used", "expired", "invalid", "error"])
    .optional(),
});

export type VerificationStatus =
  | "verified"
  | "used"
  | "expired"
  | "invalid"
  | "error";

export const Route = createFileRoute("/verify-course-wishlist")({
  validateSearch: verificationSearchSchema,
  component: VerifyCourseWishlistPage,
});

const STATUS_CONFIG = {
  verified: {
    title: "You're verified",
    description:
      "Your early signup is confirmed. We'll keep you posted with launch updates.",
    cardClass:
      "border-green-200 bg-green-50 text-green-900 dark:border-green-900/70 dark:bg-green-950/40 dark:text-green-200",
  },
  used: {
    title: "This link was already used",
    description:
      "Verification links are one-time use. If you already verified, you are all set.",
    cardClass:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200",
  },
  expired: {
    title: "This link has expired",
    description:
      "Your verification link expired. Please sign up again to receive a fresh verification email.",
    cardClass:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200",
  },
  invalid: {
    title: "Invalid verification link",
    description:
      "We could not verify this request. Please use the latest verification email.",
    cardClass:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200",
  },
  error: {
    title: "Verification is temporarily unavailable",
    description:
      "Something went wrong while verifying your email. Please try again in a moment.",
    cardClass:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200",
  },
} as const;

export function resolveVerificationStatus(
  status: VerificationStatus | undefined,
): VerificationStatus {
  return status ?? "invalid";
}

export function buildCourseWishlistVerifyUrl(apiOrigin: string, token: string) {
  const verifyUrl = new URL("/verify-course-wishlist", apiOrigin);
  verifyUrl.searchParams.set("token", token);

  return verifyUrl.toString();
}

export function getVerificationStatusConfig(status: VerificationStatus) {
  return STATUS_CONFIG[status];
}

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
