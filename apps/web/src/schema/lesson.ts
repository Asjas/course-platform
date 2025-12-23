import * as z from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen-separated"),
  videoUrl: z.string().url("Must be a valid URL"),
  videoProvider: z.enum(["youtube"]).default("youtube"),
  content: z.any().default({}),
  transcription: z.any().default({}),
  duration: z.number().int().nullable().optional(),
  order: z.number().int().min(0),
  isPreview: z.boolean().default(false),
  courseId: z.string(),
  moduleId: z.string(),
});

export const updateLessonSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen-separated")
    .optional(),
  videoUrl: z.string().url("Must be a valid URL").optional(),
  videoProvider: z.enum(["youtube"]).optional(),
  content: z.any().optional(),
  transcription: z.any().optional(),
  duration: z.number().int().nullable().optional(),
  order: z.number().int().min(0).optional(),
  isPreview: z.boolean().optional(),
});

export type CreateLessonFormData = z.infer<typeof createLessonSchema>;
export type UpdateLessonFormData = z.infer<typeof updateLessonSchema>;
