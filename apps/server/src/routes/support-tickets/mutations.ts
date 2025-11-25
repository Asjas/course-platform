import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  supportTicket,
  supportTicketComment,
} from "~/db/schema/support-tickets.js";

export type SupportTicket = typeof supportTicket.$inferSelect;
export type NewSupportTicket = typeof supportTicket.$inferInsert;
export type SupportTicketComment = typeof supportTicketComment.$inferSelect;
export type NewSupportTicketComment = typeof supportTicketComment.$inferInsert;

export async function insertSupportTicket({
  newSupportTicket,
}: {
  newSupportTicket: NewSupportTicket;
}) {
  const [ticket] = await db
    .insert(supportTicket)
    .values(newSupportTicket)
    .returning();

  return ticket;
}

export async function updateSupportTicketById({
  ticketId,
  updates,
}: {
  ticketId: string;
  updates: Partial<SupportTicket>;
}) {
  const [updatedSupportTicket] = await db
    .update(supportTicket)
    .set({ ...updates })
    .where(eq(supportTicket.id, ticketId))
    .returning();

  return updatedSupportTicket;
}

export async function deleteSupportTicketById({
  ticketId,
}: {
  ticketId: string;
}) {
  const [deletedSupportTicket] = await db
    .delete(supportTicket)
    .where(eq(supportTicket.id, ticketId))
    .returning();

  return deletedSupportTicket;
}

export async function insertSupportTicketComment({
  newSupportTicketComment,
}: {
  newSupportTicketComment: NewSupportTicketComment;
}) {
  const [comment] = await db
    .insert(supportTicketComment)
    .values(newSupportTicketComment)
    .returning();

  return comment;
}

export async function updateSupportTicketCommentById({
  commentId,
  updates,
}: {
  commentId: string;
  updates: Partial<SupportTicketComment>;
}) {
  const [updatedComment] = await db
    .update(supportTicketComment)
    .set({ ...updates })
    .where(eq(supportTicketComment.id, commentId))
    .returning();

  return updatedComment;
}

export async function deleteSupportTicketCommentById({
  commentId,
}: {
  commentId: string;
}) {
  const [deletedComment] = await db
    .delete(supportTicketComment)
    .where(eq(supportTicketComment.id, commentId))
    .returning();

  return deletedComment;
}
