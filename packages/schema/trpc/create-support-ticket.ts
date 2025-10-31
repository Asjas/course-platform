import { prefixedUlid } from "../base/prefixed-ulid.ts";
import z from "zod";

export const createSupportTicketSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().max(1000),
  repo: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  moduleId: prefixedUlid.optional(),
  lessonId: prefixedUlid.optional(),
});
