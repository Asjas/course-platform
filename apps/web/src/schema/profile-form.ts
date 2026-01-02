import * as z from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(3).trim(),
  // Username is optional - empty string is treated as no username
  // When provided, must be at least 3 characters
  username: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().min(3).nullable())
    .nullable()
    .optional(),
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

// Schema for username-only updates (used in chat username requirement modal)
export const usernameOnlySchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .trim(),
});
