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
});

export default function PasswordResetForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const { reset, formState } = form;
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setServerError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message || body?.error || "Request failed. Please try again.";

        if (body?.errors && typeof body.errors === "object") {
          for (const [field, msg] of Object.entries(body.errors)) {
            try {
              form.setError(field as any, {
                type: "server",
                message: String(msg),
              });
            } catch (err) {
              console.error("Unknown field error mapping:", err);
            }
          }
        } else {
          setServerError(message);
        }
        return;
      }

      setStatusMessage(
        "If an account exists for that email, we'll send password reset instructions shortly.",
      );

      reset();
    } catch (err) {
      setServerError(
        "Unable to reach the server. Please check your connection and try again.",
      );
      console.error(err);
    }
  }

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
          className="min-h-[1.25rem] text-sm"
        >
          {statusMessage ? (
            <div className="text-green-600">{statusMessage}</div>
          ) : serverError ? (
            <div className="text-red-600">{serverError}</div>
          ) : null}
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
                Enter the email address for the account. We'll email
                instructions to reset your password.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-start">
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
