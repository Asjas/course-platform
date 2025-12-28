import * as z from "zod";

export const createModuleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen-separated"),
  description: z.string().min(1, "Description is required"),
  order: z.number().int().min(0),
  isPreview: z.boolean().default(false),
  courseId: z.string(),
});

export const updateModuleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen-separated")
    .optional(),
  description: z.string().min(1, "Description is required").optional(),
  order: z.number().int().min(0).optional(),
  isPreview: z.boolean().optional(),
});

export type CreateModuleFormData = z.infer<typeof createModuleSchema>;
export type UpdateModuleFormData = z.infer<typeof updateModuleSchema>;
