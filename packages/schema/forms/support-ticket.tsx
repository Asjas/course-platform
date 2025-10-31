import { prefixedUlid } from "../base/prefixed-ulid.js";
import * as z from "zod";

export const supportTicketFormSchema = z.object({
  id: prefixedUlid,
  title: z.string().min(5).max(100),
  description: z.string().max(1000),
  repo: z.url(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  moduleId: prefixedUlid.optional(),
  lessonId: prefixedUlid.optional(),
});
