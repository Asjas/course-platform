import { relations, sql } from "drizzle-orm";
import { check, index, smallint, text, timestamp } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { course, courseLesson, courseModule } from "~/db/schema/course.js";
import { user } from "~/db/schema/user.js";

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
    courseId: text().references(() => course.id, { onDelete: "set null" }),
    moduleId: text().references(() => courseModule.id, {
      onDelete: "set null",
    }),
    lessonId: text().references(() => courseLesson.id, {
      onDelete: "set null",
    }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "set default" })
      .default("ghost"),
    assignedToUserId: text()
      .references(() => user.id, {
        onDelete: "set default",
      })
      .default("ghost"),
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
    attachments: text().array(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "set default" })
      .default("ghost"),
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
      .references(() => user.id, { onDelete: "set default" })
      .default("ghost"),
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
  ],
);

// New support ticket relations
export const supportTicketRelations = relations(
  supportTicket,
  ({ one, many }) => ({
    comments: many(supportTicketComment),
    attachments: many(supportTicketAttachment),
    user: one(user, {
      fields: [supportTicket.userId],
      references: [user.id],
      relationName: "support_ticket_user",
    }),
    assignedToUser: one(user, {
      fields: [supportTicket.assignedToUserId],
      references: [user.id],
      relationName: "support_ticket_assigned_to",
    }),
    course: one(course, {
      fields: [supportTicket.courseId],
      references: [course.id],
      relationName: "support_ticket_course",
    }),
    lesson: one(courseLesson, {
      fields: [supportTicket.lessonId],
      references: [courseLesson.id],
      relationName: "support_ticket_lesson",
    }),
    module: one(courseModule, {
      fields: [supportTicket.moduleId],
      references: [courseModule.id],
      relationName: "support_ticket_module",
    }),
  }),
);

// Support ticket comment relation (back-reference to ticket)
export const supportTicketCommentRelations = relations(
  supportTicketComment,
  ({ one, many }) => ({
    ticket: one(supportTicket, {
      fields: [supportTicketComment.ticketId],
      references: [supportTicket.id],
      relationName: "support_ticket_comments",
    }),
    attachments: many(supportTicketAttachment),
    user: one(user, {
      fields: [supportTicketComment.userId],
      references: [user.id],
      relationName: "support_ticket_comment_user",
    }),
  }),
);

// Support ticket attachment relation (back-reference to ticket)
export const supportTicketAttachmentRelations = relations(
  supportTicketAttachment,
  ({ one }) => ({
    ticket: one(supportTicket, {
      fields: [supportTicketAttachment.ticketId],
      references: [supportTicket.id],
      relationName: "support_ticket_attachments",
    }),
    comment: one(supportTicketComment, {
      fields: [supportTicketAttachment.commentId],
      references: [supportTicketComment.id],
      relationName: "support_ticket_attachment_comment",
    }),
  }),
);
