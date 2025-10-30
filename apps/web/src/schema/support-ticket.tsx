import * as z from "zod";

export const supportTicketFormSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().max(1000),
  repo: z.url(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
});
