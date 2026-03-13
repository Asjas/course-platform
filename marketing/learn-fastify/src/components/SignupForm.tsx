import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";

interface SignupFormProps {
  variant?: "hero" | "inline" | "footer";
  className?: string;
  courseSlug?: string;
}

type FormState =
  | "idle"
  | "loading"
  | "accepted"
  | "alreadySent"
  | "resent"
  | "error";

interface SignupApiResponse {
  success: boolean;
  status: "signup_accepted" | "email_already_sent" | "email_resent";
  message: string;
  canResend?: boolean;
}

function extractTrpcData(payload: unknown): SignupApiResponse | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeBatch = Array.isArray(payload) ? payload[0] : payload;

  if (!maybeBatch || typeof maybeBatch !== "object") {
    return null;
  }

  const result = (maybeBatch as { result?: { data?: { json?: unknown } } })
    .result;
  const json = result?.data?.json;

  if (!json || typeof json !== "object") {
    return null;
  }

  return json as SignupApiResponse;
}

const DEFAULT_COURSE_SLUG = "learn-fastify-fundamentals";
const configuredCourseSlug =
  import.meta.env.PUBLIC_COURSE_SLUG?.trim() || DEFAULT_COURSE_SLUG;

export default function SignupForm({
  variant = "hero",
  className = "",
  courseSlug = configuredCourseSlug,
}: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [canResend, setCanResend] = useState(false);

  const submitSignup = async ({ resend }: { resend: boolean }) => {
    if (!email) {
      return;
    }

    setFormState("loading");
    setErrorMessage("");
    setInfoMessage("");
    setCanResend(false);

    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source") || undefined;
      const utmMedium = urlParams.get("utm_medium") || undefined;
      const utmCampaign = urlParams.get("utm_campaign") || undefined;

      const response = await fetch(
        `${import.meta.env.PUBLIC_API_URL || "https://api.codewizard.training"}/trpc/courseWishlist.signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            json: {
              email,
              name: name || undefined,
              courseSlug,
              resend,
              referrer: document.referrer || undefined,
              utmSource,
              utmMedium,
              utmCampaign,
            },
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error?.message || "Failed to sign up");
      }

      const payload = await response.json();
      const data = extractTrpcData(payload);

      if (!data || !data.success) {
        throw new Error("Failed to sign up");
      }

      if (data.status === "email_already_sent") {
        setFormState("alreadySent");
        setInfoMessage("Email has already been sent, check spam/junk folders.");
        setCanResend(Boolean(data.canResend));
        return;
      }

      if (data.status === "email_resent") {
        setFormState("resent");
        setInfoMessage(
          "Email has been resent. Please check your spam/junk folders.",
        );
        setCanResend(true);
        return;
      }

      setFormState("accepted");
      setInfoMessage("That signup has been accepted.");
      setEmail("");
      setName("");
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitSignup({ resend: false });
  };

  const handleResend = async () => {
    await submitSignup({ resend: true });
  };

  if (formState === "accepted" || formState === "resent") {
    return (
      <div
        className={`flex items-center justify-center gap-4 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400 ${className}`}
        role="alert"
      >
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <div className="text-center">
          <p className="font-medium">{infoMessage}</p>
          <p className="text-sm opacity-90">
            Check your inbox for a confirmation email.
          </p>
        </div>
      </div>
    );
  }

  if (formState === "alreadySent") {
    return (
      <div
        className={`space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 ${className}`}
        role="alert"
      >
        <p className="font-medium">{infoMessage}</p>
        {canResend ? (
          <button
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={handleResend}
            disabled={formState === "loading"}
          >
            {formState === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resending...</span>
              </>
            ) : (
              <span>Resend Email</span>
            )}
          </button>
        ) : null}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <form
        className={`space-y-4 ${className}`}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-green-400"
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={formState === "loading"}
          />
          <input
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-green-400"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
            disabled={formState === "loading"}
          />
        </div>
        <button
          className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 dark:from-green-500 dark:to-green-600 dark:text-white dark:hover:from-green-600 dark:hover:to-green-700"
          type="submit"
          disabled={formState === "loading" || !email}
        >
          {formState === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing up...</span>
            </>
          ) : (
            <>
              <Mail className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
              <span>Get Early Access</span>
            </>
          )}
        </button>
        {formState === "error" && (
          <div
            className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Join the waitlist and be the first to know when we launch.
          <br />
          No spam, ever. Unsubscribe anytime.
        </p>
      </form>
    );
  }

  // Inline variant (more compact)
  return (
    <form
      className={`flex flex-col gap-2 sm:flex-row ${className}`}
      onSubmit={handleSubmit}
    >
      <input
        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-green-400"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label="Email address"
        disabled={formState === "loading"}
      />
      <button
        className="cursor-pointer rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 font-medium text-white transition-all hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:from-green-500 dark:to-green-600 dark:text-white"
        type="submit"
        disabled={formState === "loading" || !email}
      >
        {formState === "loading" ? (
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        ) : (
          "Get Early Access"
        )}
      </button>
      {formState === "error" && (
        <div
          className="col-span-full flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </form>
  );
}
