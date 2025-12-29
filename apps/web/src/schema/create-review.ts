import * as z from "zod";

export const createReviewSchema = z.object({
  userId: z.string().min(1, "User is required"),
  courseId: z.string().min(1, "Course is required"),
  rating: z.number().int().min(1).max(5).nullable(),
  title: z.string().min(1, "Title is required").max(100),
  comment: z.string().min(1, "Comment is required").max(2000),
  externalLink: z.string(),
  approved: z.boolean(),
});

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
