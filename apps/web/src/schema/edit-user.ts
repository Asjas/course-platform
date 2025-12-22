import * as z from "zod";

export const editUserSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().optional(),
  displayUsername: z.string().optional(),
  color: z.string().optional(),
  emailVerified: z.boolean(),
  role: z.enum(["member", "admin"]),
  banned: z.boolean(),
  banReason: z.string().optional(),
  banExpires: z.string().optional(), // ISO date string or empty
});

export type EditUserFormData = z.infer<typeof editUserSchema>;
