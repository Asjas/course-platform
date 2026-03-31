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
