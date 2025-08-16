import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod/mini";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const formSchema = z.object({
  email: z.email().check(z.trim()),
  username: z.string().check(z.minLength(3), z.maxLength(30), z.trim()),
  password: z.string().check(z.minLength(5), z.maxLength(80), z.trim()),
});

export default function SignUpForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const { watch, reset, formState } = form;
  const passwordValue = watch("password", "");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function passwordStrength(pw: string) {
    let score = 0;

    if (!pw) return score;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    return score;
  }

  function strengthLabel(score: number) {
    if (score <= 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";

    return "Strong";
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message || body?.error || "Sign up failed. Please try again.";
        setServerError(message);
        return;
      }

      reset();

      console.log("Sign up successful");
    } catch (err) {
      setServerError(
        "Unable to reach the server. Please check your connection.",
      );

      console.error(err);
    }
  }

  const strength = passwordStrength(passwordValue);
  const isSubmitting = formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <div
          role="status"
          aria-live="polite"
          className="min-h-[1.25rem] text-sm text-red-600"
        >
          {serverError ? serverError : null}
        </div>

        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We'll use this to send account notifications. It won't be shown
                publicly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="your-username"
                  autoComplete="username"
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Pick a unique name (3–30 characters). This will be shown
                publicly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-pressed={showPassword}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </FormControl>

              <FormDescription>
                Use at least 8 characters for stronger security. We recommend
                adding numbers and symbols.
              </FormDescription>

              <div className="mt-2">
                <div
                  className="h-2 w-full rounded bg-slate-200"
                  aria-hidden
                >
                  <div
                    style={{ width: `${(strength / 4) * 100}%` }}
                    className={`h-2 rounded ${
                      strength <= 1
                        ? "bg-red-500"
                        : strength === 2
                          ? "bg-yellow-400"
                          : strength === 3
                            ? "bg-blue-500"
                            : "bg-green-600"
                    }`}
                  />
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {passwordValue
                    ? `Strength: ${strengthLabel(strength)}`
                    : "Enter a password to see strength"}
                </div>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
}
