import * as z from "zod";

export const editReviewSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  comment: z
    .string()
    .min(1, "Comment is required")
    .max(2000, "Comment must be 2000 characters or less"),
});

export type EditReviewFormData = z.infer<typeof editReviewSchema>;
