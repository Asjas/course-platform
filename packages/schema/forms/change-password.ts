import * as z from "zod";

export const changePasswordFormSchema = z.object({
  currentPassword: z
    .string()
    .min(5, "Password must be at least 5 characters")
    .max(80, "Password must be at most 80 characters")
    .trim(),
  newPassword: z
    .string()
    .min(5, "Password must be at least 5 characters")
    .max(80, "Password must be at most 80 characters")
    .trim(),
});
