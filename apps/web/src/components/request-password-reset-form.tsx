import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import FormStatusMessage from "~/components/ui/form-status-message";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth.client";

const formSchema = z.object({
  email: z.email("Invalid email address").trim(),
});

export default function RequestPasswordResetForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onBlur: formSchema,
    },
    onSubmit: async ({ value: { email } }) => {
      setServerError(null);

      const { error } = await authClient.requestPasswordReset(
        { email },
        {
          onSuccess: () => {
            setStatusMessage(
              "If an account is associated with the provided email, a password reset link has been sent. (Please check your inbox and spam/junk folder.)",
            );
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
        event.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      {/* Server error */}
      <FormStatusMessage
        statusMessage={statusMessage}
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
              state={state}
              handleChange={handleChange}
              handleBlur={handleBlur}
              errorType="reset-password"
            />
          </div>
        )}
      />

      {/* Submit Button */}
      <form.Subscribe
        selector={(state) => [state.isDirty, state.isSubmitting]}
        children={([isDirty, isSubmitting]) => (
          <Button
            className="flex items-center gap-2"
            type="submit"
            disabled={!isDirty || isSubmitting}
            aria-disabled={!isDirty || isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Sending reset link…" : "Send reset link"}
          </Button>
        )}
      />
    </form>
  );
}
