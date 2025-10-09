import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import FormStatusMessage from "~/components/ui/form-status-message";
import { CheckboxInput, Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth.client";

const formSchema = z.object({
  email: z.email().trim(),
  password: z
    .string()
    .min(5, "Password must be at least 5 characters")
    .max(80, "Password must be at most 80 characters")
    .trim(),
  remember: z.boolean(),
});

export default function SignInForm({
  search,
}: {
  search: { redirect?: string };
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    validators: {
      onBlur: formSchema,
    },
    onSubmit: async ({ value: { email, password, remember } }) => {
      setServerError(null);

      const { error } = await authClient.signIn.email(
        { email, password, rememberMe: remember },
        {
          onSuccess: () => {
            toast.success("Successfully signed in!");

            navigate({
              to: search.redirect ?? "/dashboard",
            });
          },
          onError: ({ error }) => {
            setServerError(error.message);
          },
        },
      );

      if (error) console.error(error);
    },
  });

  return (
    <form
      className="space-y-4 md:space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      noValidate
    >
      {/* Server error */}
      <FormStatusMessage
        statusMessage={null}
        serverError={serverError}
      />

      {/* Email Field */}
      <form.Field
        name="email"
        children={({ state, handleChange, handleBlur }) => (
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              errorType="email-error"
              state={state}
              handleChange={handleChange}
              handleBlur={handleBlur}
              required={true}
            />
          </div>
        )}
      />

      {/* Password Field */}
      <form.Field
        name="password"
        children={({ state, handleChange, handleBlur }) => (
          <div className="relative grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              autoComplete="current-password"
              type="password"
              errorType="password-error"
              state={state}
              handleChange={handleChange}
              handleBlur={handleBlur}
              required={true}
            />
          </div>
        )}
      />

      {/* Remember Me Checkbox */}
      <form.Field
        name="remember"
        children={({ state, handleChange }) => (
          <div className="flex items-center gap-2">
            <CheckboxInput
              id="remember"
              value={state.value}
              handleChange={handleChange}
            />
            <Label htmlFor="remember">Remember Me</Label>
          </div>
        )}
      />

      {/* Submit Button */}
      <Button
        className="flex items-center gap-2"
        type="submit"
        disabled={form.state.isSubmitting}
        aria-disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {form.state.isSubmitting ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
