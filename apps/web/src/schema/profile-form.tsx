import * as z from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(3).trim(),
  username: z.string().min(3).trim().nullable().optional(),
  image: z.string().nullable().optional(),
});
