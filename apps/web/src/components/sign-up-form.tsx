import { useForm, useStore } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import BlockerComponent from "~/components/blocker";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth.client";
import { useAuth } from "~/lib/auth.context";
import { signUpFormSchema } from "~/schema/sign-up";

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
      onBlur: signUpFormSchema,
      onSubmit: signUpFormSchema,
    },
    onSubmit: async ({ value: { name, email, password } }) => {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      console.log("error", error);

      if (error) {
        form.setFieldMeta("email", (oldMeta) => ({
          ...oldMeta,
          isTouched: true,
          errorMap: { onSubmit: error },
        }));

        toast.error(error.message || "Failed to sign up");
        return;
      }

      form.reset();
      toast.success("Signed up successfully!");
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (auth.isAuthenticated) {
        navigate({ to: "/dashboard" });
      }
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <form
      className="space-y-4 md:space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      noValidate
    >
      <BlockerComponent formIsDirty={isDirty} />

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
        {isSubmitting ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
}
