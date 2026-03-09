import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import BlockerComponent from "~/components/blocker";
import { Button } from "~/components/ui/button";
import { CheckboxInput, Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth.client";
import { signInFormSchema } from "~/schema/sign-in";

export default function SignInForm() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
    validators: {
      onBlur: signInFormSchema,
      onSubmit: signInFormSchema,
    },
    onSubmit: async ({ value: { email, password, remember } }) => {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe: remember,
      });

      if (error) {
        form.setFieldMeta("email", (oldMeta) => ({
          ...oldMeta,
          isTouched: true,
          errorMap: { onSubmit: error },
        }));

        toast.error(error.message || "Failed to sign in");
        return;
      }

      form.reset();
      toast.success("Signed in successfully!");
      await new Promise((resolve) => setTimeout(resolve, 300));

      navigate({ to: "/dashboard" });
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
      <form.Subscribe
        selector={(state) => [state.isDirty]}
        children={([isDirty]) => <BlockerComponent formIsDirty={isDirty} />}
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
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        )}
      />
    </form>
  );
}
