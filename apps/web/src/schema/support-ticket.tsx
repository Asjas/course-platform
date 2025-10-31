import * as z from "zod";

export const supportTicketFormSchema = z.object({
  id: z.string(),
  title: z.string().min(5).max(100),
  description: z.string().max(1000),
  repo: z.httpUrl(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
});
