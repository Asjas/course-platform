import * as z from "zod";

export const requestPasswordResetFormSchema = z.object({
  email: z.string().trim().check(z.email("Invalid email address")),
});
