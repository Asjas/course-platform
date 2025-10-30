import * as z from "zod";

export const changeEmailFormSchema = z.object({
  newEmail: z.email().trim(),
});
