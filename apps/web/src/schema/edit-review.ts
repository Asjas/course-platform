import * as z from "zod";

export const editReviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  comment: z.string().min(1, "Comment is required"),
});

export type EditReviewFormData = z.infer<typeof editReviewSchema>;
