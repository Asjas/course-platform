import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import {
  type NewSupportTicket,
  type NewSupportTicketComment,
  type SupportTicket,
  type SupportTicketComment,
  supportTicket,
  supportTicketComment,
} from "~/db/schema/support-tickets.js";

export async function insertSupportTicket({
  newSupportTicket,
}: {
  newSupportTicket: NewSupportTicket;
}) {
  const id = `suptik:${ulid()}`;
  const newSupportTicketWithId = { id, ...newSupportTicket };

  const [ticket] = await db
    .insert(supportTicket)
    .values(newSupportTicketWithId)
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
  const id = `suptikcom:${ulid()}`;
  const newSupportTicketCommentWithId = { id, ...newSupportTicketComment };

  const [comment] = await db
    .insert(supportTicketComment)
    .values(newSupportTicketCommentWithId)
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
