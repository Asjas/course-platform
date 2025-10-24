import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import FormStatusMessage from "~/components/ui/form-status-message";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/lib/auth.context.ts";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),
    email: z.email().trim(),
    password: z
      .string()
      .min(5, "Password must be at least 5 characters")
      .max(80, "Password must be at most 80 characters")
      .trim(),
    confirmPassword: z
      .string()
      .min(5, "Password must be at least 5 characters")
      .max(80, "Password must be at most 80 characters")
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignUpForm() {
  const navigate = useNavigate();
  const auth = useAuth();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value: { name, email, password } }) => {
      await auth.signUp(name, email, password);

      if (auth.isAuthenticated) {
        navigate({ to: "/dashboard" });
      }
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
        serverError={auth?.serverError}
      />

      {/* Name Field */}
      <form.Field
        name="name"
        children={({ state, handleChange, handleBlur }) => (
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Name"
              autoComplete="name"
              state={state}
              handleChange={handleChange}
              handleBlur={handleBlur}
              errorType="name-error"
              required={true}
            />
          </div>
        )}
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
              state={state}
              handleChange={handleChange}
              handleBlur={handleBlur}
              errorType="email-error"
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
              type="password"
              autoComplete="new-password"
              state={state}
              handleChange={handleChange}
              handleBlur={handleBlur}
              errorType="password-error"
              required={true}
            />
          </div>
        )}
      />

      {/* Confirm Password Field */}
      <form.Field
        name="confirmPassword"
        children={({ state, handleChange, handleBlur }) => (
          <div className="relative grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              state={state}
              handleChange={handleChange}
              handleBlur={handleBlur}
              errorType="confirm-password-error"
              required={true}
            />
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
        {form.state.isSubmitting ? "Signing up…" : "Sign Up"}
      </Button>
    </form>
  );
}
