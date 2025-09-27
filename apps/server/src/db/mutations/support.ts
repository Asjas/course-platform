import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  supportTicket,
  supportTicketAttachment,
  supportTicketComment,
} from "~/db/schema/support.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:support" });

export type supportTicket = typeof supportTicket.$inferSelect;
export type newSupportTicket = typeof supportTicket.$inferInsert;
export type supportTicketComment = typeof supportTicketComment.$inferSelect;
export type newSupportTicketComment = typeof supportTicketComment.$inferInsert;
export type supportTicketAttachment =
  typeof supportTicketAttachment.$inferSelect;
export type newSupportTicketAttachment =
  typeof supportTicketAttachment.$inferInsert;

export async function insertSupportTicket(newSupportTicket: newSupportTicket) {
  try {
    const result = await db
      .insert(supportTicket)
      .values(newSupportTicket)
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert support ticket");

    throw err;
  }
}

export async function updateSupportTicketById(
  id: string,
  updates: Partial<supportTicket>,
) {
  try {
    const result = await db
      .update(supportTicket)
      .set({ ...updates })
      .where(eq(supportTicket.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update support ticket with id ${id}`);
    throw err;
  }
}

export async function deleteSupportTicketById({ id }: supportTicket) {
  try {
    const result = db
      .delete(supportTicket)
      .where(eq(supportTicket.id, id))
      .returning({ id: supportTicket.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete support ticket with id ${id}`);
    throw err;
  }
}

export async function insertSupportTicketComment(
  newSupportTicketComment: newSupportTicketComment,
) {
  try {
    const result = await db
      .insert(supportTicketComment)
      .values(newSupportTicketComment)
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert support ticket comment");

    throw err;
  }
}

export async function updateSupportTicketCommentById(
  id: string,
  updates: Partial<supportTicketComment>,
) {
  try {
    const result = await db
      .update(supportTicketComment)
      .set({ ...updates })
      .where(eq(supportTicketComment.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update support ticket comment with id ${id}`);
    throw err;
  }
}

export async function deleteSupportTicketCommentById({
  id,
}: supportTicketComment) {
  try {
    const result = db
      .delete(supportTicketComment)
      .where(eq(supportTicketComment.id, id))
      .returning({ id: supportTicketComment.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete support ticket comment with id ${id}`);
    throw err;
  }
}

export async function insertSupportTicketAttachment(
  newSupportTicketAttachment: newSupportTicketAttachment,
) {
  try {
    const result = await db
      .insert(supportTicketAttachment)
      .values(newSupportTicketAttachment)
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert support ticket attachment");

    throw err;
  }
}

export async function updateSupportTicketAttachmentById(
  id: string,
  updates: Partial<supportTicketAttachment>,
) {
  try {
    const result = await db
      .update(supportTicketAttachment)
      .set({ ...updates })
      .where(eq(supportTicketAttachment.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update support ticket attachment with id ${id}`);
    throw err;
  }
}

export async function deleteSupportTicketAttachmentById({
  id,
}: supportTicketAttachment) {
  try {
    const result = db
      .delete(supportTicketAttachment)
      .where(eq(supportTicketAttachment.id, id))
      .returning({ id: supportTicketAttachment.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete support ticket attachment with id ${id}`);
    throw err;
  }
}
