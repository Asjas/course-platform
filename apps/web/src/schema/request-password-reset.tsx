import * as z from "zod";

export const requestPasswordResetFormSchema = z.object({
  email: z.email("Invalid email address").trim(),
});
