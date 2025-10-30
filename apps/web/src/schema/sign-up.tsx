import * as z from "zod";

export const signUpFormSchema = z
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
