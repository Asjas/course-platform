import * as z from "zod";

export const passwordResetFormSchema = z
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
