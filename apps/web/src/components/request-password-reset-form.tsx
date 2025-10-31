import { requestPasswordResetFormSchema } from "@packages/schema/forms/request-password-reset";
import { useForm, useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import BlockerComponent from "~/components/blocker.tsx";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth.client";

export default function RequestPasswordResetForm() {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onBlur: requestPasswordResetFormSchema,
      onSubmit: requestPasswordResetFormSchema,
    },
    onSubmit: async ({ value: { email } }) => {
      const { error } = await authClient.requestPasswordReset({ email });

      if (error) {
        form.setFieldMeta("email", (oldMeta) => ({
          ...oldMeta,
          isTouched: true,
          errorMap: { onSubmit: error },
        }));

        toast.error(error.message || "Failed to request password reset");
        return;
      }

      form.reset();
      toast.success("Password reset link sent! Please check your inbox.");
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
              errorType="reset-password"
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
        {isSubmitting ? "Sending reset link…" : "Send reset link"}
      </Button>
    </form>
  );
}
