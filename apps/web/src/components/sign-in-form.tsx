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
  password: z.string().check(z.minLength(5), z.maxLength(80), z.trim()),
  remember: z.boolean(),
});

export default function SignInForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const { watch, reset, formState } = form;
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message || body?.error || "Sign in failed. Please try again.";

        if (body?.errors && typeof body.errors === "object") {
          for (const [field, msg] of Object.entries(body.errors)) {
            try {
              form.setError(field as any, {
                type: "server",
                message: String(msg),
              });
            } catch (error) {
              console.error(error);
            }
          }
        } else {
          setServerError(message);
        }
        return;
      }

      reset();
      console.log("Signed in successfully");
    } catch (err) {
      setServerError(
        "Unable to reach the server. Please check your connection.",
      );
      console.error(err);
    }
  }

  const isSubmitting = formState.isSubmitting;
  const passwordValue = watch("password", "");
  const rememberValue = watch("remember", false);

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
                Use the email address associated with your account.
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
                    autoComplete="current-password"
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
                Enter the password for your account.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="remember"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Input
                  id="remember"
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                />
              </FormControl>
              <label
                htmlFor="remember"
                className="text-sm"
              >
                Remember me
              </label>
              <FormDescription className="text-muted-foreground ml-auto text-xs">
                {rememberValue
                  ? "Will keep you signed in"
                  : "Signed in only for this session"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
