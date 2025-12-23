import * as z from "zod";

export const createCourseSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen-separated"),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  level: z
    .enum(["All levels", "Beginner", "Intermediate", "Advanced"])
    .default("All levels"),
  thumbnailUrl: z.string().url().nullable().optional(),
  published: z.boolean().default(false),
  isFree: z.boolean().default(false),
  price: z.number().int().min(0).default(19),
  priceCurrency: z.string().default("USD"),
  isSaleActive: z.boolean().default(false),
  salePrice: z.number().int().min(0).default(0),
  saleStartAt: z.date().nullable().optional(),
  saleExpiresAt: z.date().nullable().optional(),
  trialModuleLimit: z.number().int().min(0).default(0),
  authorId: z.string(),
});

export const updateCourseSchema = z.object({
  id: z.string(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen-separated")
    .optional(),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().nullable().optional(),
  level: z
    .enum(["All levels", "Beginner", "Intermediate", "Advanced"])
    .optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  published: z.boolean().optional(),
  isFree: z.boolean().optional(),
  price: z.number().int().min(0).optional(),
  priceCurrency: z.string().optional(),
  isSaleActive: z.boolean().optional(),
  salePrice: z.number().int().min(0).optional(),
  saleStartAt: z.date().nullable().optional(),
  saleExpiresAt: z.date().nullable().optional(),
  trialModuleLimit: z.number().int().min(0).optional(),
});

export type CreateCourseFormData = z.infer<typeof createCourseSchema>;
export type UpdateCourseFormData = z.infer<typeof updateCourseSchema>;
