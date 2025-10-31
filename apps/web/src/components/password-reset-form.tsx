import { passwordResetFormSchema } from "@packages/schema/forms/password-reset";
import { useForm, useStore } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import BlockerComponent from "~/components/blocker.tsx";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth.client";

export default function PasswordResetForm({ token }: { token: string }) {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: passwordResetFormSchema,
      onSubmit: passwordResetFormSchema,
    },
    onSubmit: async ({ value: { password } }) => {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        form.setFieldMeta("confirmPassword", (oldMeta) => ({
          ...oldMeta,
          isTouched: true,
          errorMap: { onSubmit: error },
        }));

        toast.error(error.message || "Failed to reset password");
        return;
      }

      form.reset();
      toast.success("Password reset successfully!");
      await new Promise((resolve) => setTimeout(resolve, 300));

      navigate({ to: "/signin", replace: true });
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

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
      <BlockerComponent formIsDirty={isDirty} />

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
      <Button
        className="flex items-center gap-2"
        type="submit"
        disabled={!isDirty || isSubmitting}
        aria-disabled={!isDirty || isSubmitting}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Resetting password..." : "Reset password"}
      </Button>
    </form>
  );
}
