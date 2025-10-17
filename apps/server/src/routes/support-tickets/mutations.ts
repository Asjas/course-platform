import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import {
  supportTicket,
  supportTicketAttachment,
  supportTicketComment,
} from "~/db/schema/support-tickets.js";

export type SupportTicket = typeof supportTicket.$inferSelect;
export type NewSupportTicket = Omit<typeof supportTicket.$inferInsert, "id">;
export type SupportTicketComment = typeof supportTicketComment.$inferSelect;
export type NewSupportTicketComment = Omit<
  typeof supportTicketComment.$inferInsert,
  "id"
>;
export type SupportTicketAttachment =
  typeof supportTicketAttachment.$inferSelect;
export type NewSupportTicketAttachment = Omit<
  typeof supportTicketAttachment.$inferInsert,
  "id"
>;

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

export async function insertSupportTicketAttachment({
  newSupportTicketAttachment,
}: {
  newSupportTicketAttachment: NewSupportTicketAttachment;
}) {
  const id = `suptikatt:${ulid()}`;
  const newSupportTicketAttachmentWithId = {
    id,
    ...newSupportTicketAttachment,
  };

  const [ticketAttachment] = await db
    .insert(supportTicketAttachment)
    .values(newSupportTicketAttachmentWithId)
    .returning();

  return ticketAttachment;
}

export async function updateSupportTicketAttachmentById({
  attachmentId,
  updates,
}: {
  attachmentId: string;
  updates: Partial<SupportTicketAttachment>;
}) {
  const [updatedAttachment] = await db
    .update(supportTicketAttachment)
    .set({ ...updates })
    .where(eq(supportTicketAttachment.id, attachmentId))
    .returning();

  return updatedAttachment;
}

export async function deleteSupportTicketAttachmentById({
  attachmentId,
}: {
  attachmentId: string;
}) {
  const [deletedAttachment] = await db
    .delete(supportTicketAttachment)
    .where(eq(supportTicketAttachment.id, attachmentId))
    .returning();

  return deletedAttachment;
}

export async function deleteSupportTicketCommentAttachmentsById({
  commentId,
  attachmentId,
}: {
  commentId: string;
  attachmentId: string;
}) {
  const [deletedAttachment] = await db
    .delete(supportTicketAttachment)
    .where(
      and(
        eq(supportTicketAttachment.commentId, commentId),
        eq(supportTicketAttachment.id, attachmentId),
      ),
    )
    .returning();

  return deletedAttachment;
}
