import * as z from "zod";

export const signInFormSchema = z.object({
  email: z.email().trim(),
  password: z
    .string()
    .min(5, "Password must be at least 5 characters")
    .max(80, "Password must be at most 80 characters")
    .trim(),
  remember: z.boolean(),
});
