import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  supportTicket,
  supportTicketAttachment,
  supportTicketComment,
} from "~/db/schema/support.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:support" });

export type SupportTicket = typeof supportTicket.$inferSelect;
export type NewSupportTicket = typeof supportTicket.$inferInsert;
export type SupportTicketComment = typeof supportTicketComment.$inferSelect;
export type NewSupportTicketComment = typeof supportTicketComment.$inferInsert;
export type SupportTicketAttachment =
  typeof supportTicketAttachment.$inferSelect;
export type NewSupportTicketAttachment =
  typeof supportTicketAttachment.$inferInsert;

export async function insertSupportTicket({
  newSupportTicket,
}: {
  newSupportTicket: NewSupportTicket;
}) {
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

export async function updateSupportTicketById({
  id,
  updates,
}: {
  id: string;
  updates: Partial<SupportTicket>;
}) {
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

export async function deleteSupportTicketById(id: string) {
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
  newSupportTicketComment: NewSupportTicketComment,
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

export async function updateSupportTicketCommentById({
  id,
  updates,
}: {
  id: string;
  updates: Partial<SupportTicketComment>;
}) {
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

export async function deleteSupportTicketCommentById(id: string) {
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

export async function insertSupportTicketAttachment({
  newSupportTicketAttachment,
}: {
  newSupportTicketAttachment: NewSupportTicketAttachment;
}) {
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

export async function updateSupportTicketAttachmentById({
  id,
  updates,
}: {
  id: string;
  updates: Partial<SupportTicketAttachment>;
}) {
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

export async function deleteSupportTicketAttachmentById(id: string) {
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
