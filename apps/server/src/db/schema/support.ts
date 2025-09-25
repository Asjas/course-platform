import { sql } from "drizzle-orm";
import { check, index, smallint, text, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { course, courseLesson } from "~/db/schema/course.js";
import { mySchema, user } from "~/db/schema/user.js";

export const supportTicketStatus = mySchema.enum("support_ticket_status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
]);

export const supportTicketPriority = mySchema.enum("support_ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const supportTicket = mySchema.table(
  "support_ticket",
  {
    id: text().primaryKey(),
    title: text().notNull(),
    description: text().notNull(),
    repo: text(),
    status: supportTicketStatus().default("open").notNull(),
    priority: supportTicketPriority().default("medium").notNull(),
    lessonId: text().references(() => courseLesson.id, {
      onDelete: "set null",
    }),
    courseId: text().references(() => course.id, { onDelete: "set null" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    assignedToUserId: text().references(() => user.id, {
      onDelete: "set null",
    }),
    assignedAt: timestamp({ withTimezone: true }),
    resolvedAt: timestamp({ withTimezone: true }),
    closedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("support_ticket_user_idx").on(table.userId),
    index("support_ticket_assigned_to_user_idx").on(table.assignedToUserId),
    index("support_ticket_status_idx").on(table.status),
    index("support_ticket_priority_idx").on(table.priority),
    index("support_ticket_course_idx").on(table.courseId),
    index("support_ticket_lesson_idx").on(table.lessonId),
    check(
      "support_ticket_status_check",
      sql`${table.status} IN ('open', 'in_progress', 'resolved', 'closed')`,
    ),
    check(
      "support_ticket_priority_check",
      sql`${table.priority} IN ('low', 'medium', 'high', 'urgent')`,
    ),
    check(
      "support_ticket_resolution_check",
      sql`(${table.status} = 'resolved' AND ${table.resolvedAt} IS NOT NULL) OR (${table.status} != 'resolved' AND ${table.resolvedAt} IS NULL)`,
    ),
    check(
      "support_ticket_closure_check",
      sql`(${table.status} = 'closed' AND ${table.closedAt} IS NOT NULL) OR (${table.status} != 'closed' AND ${table.closedAt} IS NULL)`,
    ),
  ],
);

export const supportTicketComment = mySchema.table(
  "support_ticket_comment",
  {
    id: text().primaryKey(),
    comment: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    ticketId: text()
      .notNull()
      .references(() => supportTicket.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("support_ticket_comment_user_idx").on(table.userId),
    index("support_ticket_comment_ticket_idx").on(table.ticketId),
    check("support_ticket_comment_check", sql`${table.comment} <> ''`),
  ],
);

export const supportTicketAttachment = mySchema.table(
  "support_ticket_attachment",
  {
    id: text().primaryKey(),
    fileUrl: text().notNull(),
    fileType: text(),
    fileSize: smallint(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    ticketId: text()
      .notNull()
      .references(() => supportTicket.id, { onDelete: "cascade" }),
    commentId: text().references(() => supportTicketComment.id, {
      onDelete: "cascade",
    }),
    ...timestamps,
  },
  (table) => [
    index("support_ticket_attachment_user_idx").on(table.userId),
    index("support_ticket_attachment_ticket_idx").on(table.ticketId),
    index("support_ticket_attachment_comment_idx").on(table.commentId),
    check(
      "support_ticket_attachment_file_url_check",
      sql`${table.fileUrl} <> ''`,
    ),
    check(
      "support_ticket_attachment_file_size_check",
      sql`${table.fileSize} IS NULL OR ${table.fileSize} > 0`,
    ),
    check(
      "support_ticket_attachment_file_type_check",
      sql`${table.fileType} IS NULL OR ${table.fileType} <> ''`,
    ),
    check(
      "support_ticket_attachment_comment_check",
      sql`${table.commentId} IS NULL OR ${table.commentId} IN (SELECT id FROM support_ticket_comment)`,
    ),
    check(
      "support_ticket_attachment_ticket_check",
      sql`${table.ticketId} IN (SELECT id FROM support_ticket)`,
    ),
  ],
);
