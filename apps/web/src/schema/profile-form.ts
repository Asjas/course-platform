import * as z from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(3).trim(),
  username: z.string().min(3).trim().nullable().optional(),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Color must be a valid hex color (e.g. #FF5733)",
    )
    .nullable()
    .optional(),
  image: z.httpUrl().nullable().optional(),
});
