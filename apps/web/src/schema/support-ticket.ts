import * as z from "zod";

export const supportTicketFormSchema = z.object({
  title: z
    .string("Expected title to have between 5 and 100 characters")
    .min(5)
    .max(100),
  description: z.string("Expected a description"),
  repo: z.url("Expected a valid URL for the repository"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
});
