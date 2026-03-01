import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";

interface SignupFormProps {
  variant?: "hero" | "inline" | "footer";
  className?: string;
  courseSlug?: string;
}

type FormState = "idle" | "loading" | "success" | "error";

export default function SignupForm({
  variant = "hero",
  className = "",
  courseSlug = "learn-fastify-fundamentals",
}: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) return;

    setFormState("loading");
    setErrorMessage("");

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

      setFormState("success");
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

  if (formState === "success") {
    return (
      <div
        className={`flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400 ${className}`}
        role="alert"
      >
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-medium">You're on the list!</p>
          <p className="text-sm opacity-90">
            Check your inbox for a confirmation email.
          </p>
        </div>
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
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-teal-400"
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={formState === "loading"}
          />
          <input
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-teal-400"
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
          className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 dark:from-teal-400 dark:to-cyan-400 dark:text-gray-900 dark:hover:from-teal-500 dark:hover:to-cyan-500"
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
        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-teal-400"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label="Email address"
        disabled={formState === "loading"}
      />
      <button
        className="cursor-pointer rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 font-medium text-white transition-all hover:from-teal-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:from-teal-400 dark:to-cyan-400 dark:text-gray-900"
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
