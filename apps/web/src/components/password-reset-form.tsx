import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import BlockerComponent from "~/components/blocker.tsx";
import { Button } from "~/components/ui/button";
import FormStatusMessage from "~/components/ui/form-status-message";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth.client";

const formSchema = z
  .object({
    password: z
      .string()
      .min(5, "Password must be at least 5 characters")
      .max(100, "Password must be at most 100 characters")
      .trim(),
    confirmPassword: z
      .string()
      .min(5, "Confirm password must be at least 5 characters")
      .max(100, "Confirm password must be at most 100 characters")
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function PasswordResetForm({ token }: { token: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: formSchema,
    },
    onSubmit: async ({ value: { password } }) => {
      setServerError(null);

      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        console.error(error);
        setServerError(error.message || "Failed to reset password");
        return;
      }

      // Wait 300ms before navigating
      toast.success("Password reset successfully!");
      form.reset();
      await new Promise((resolve) => setTimeout(resolve, 300));

      navigate({ to: "/signin", replace: true });
    },
  });

  return (
    <form
      className="space-y-4 md:space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      {/* Server error */}
      <FormStatusMessage
        statusMessage={null}
        serverError={serverError}
      />

      {/* Password Field */}
      <form.Field
        name="password"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="new-password"
              state={field.state}
              handleChange={field.handleChange}
              handleBlur={field.handleBlur}
              errorType="new-password"
            />
          </div>
        )}
      />

      {/* Confirm Password Field */}
      <form.Field
        name="confirmPassword"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              state={field.state}
              handleChange={field.handleChange}
              handleBlur={field.handleBlur}
              errorType="confirm-password"
            />
          </div>
        )}
      />

      {/* Submit Button */}
      <form.Subscribe
        selector={(state) => [state.isDirty, state.isSubmitting]}
        children={([isDirty, isSubmitting]) => (
          <>
            <Button
              className="flex items-center gap-2"
              type="submit"
              disabled={!isDirty || isSubmitting}
              aria-disabled={!isDirty || isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Resetting password..." : "Reset password"}
            </Button>
            <BlockerComponent formIsDirty={isDirty} />
          </>
        )}
      />
    </form>
  );
}
