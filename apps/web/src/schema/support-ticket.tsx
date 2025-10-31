import * as z from "zod";

export const supportTicketFormSchema = z.object({
  id: z.ulid(),
  title: z.string().min(5).max(100),
  description: z.string().max(1000),
  repo: z.httpUrl(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  moduleId: z.ulid().optional(),
  lessonId: z.ulid().optional(),
});
