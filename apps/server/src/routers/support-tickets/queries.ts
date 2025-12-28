import { asc, count, eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { supportTicket } from "~/db/schema/support-tickets.js";

export type AllSupportTickets = Awaited<
  ReturnType<typeof getAllSupportTickets>
>;
export type SupportTicketById = Awaited<
  ReturnType<typeof getSupportTicketById>
>;
export type SupportTicketCommentById = Awaited<
  ReturnType<typeof getSupportTicketCommentById>
>;
export type SupportTicketCountsByCourse = Awaited<
  ReturnType<typeof getSupportTicketCountsByCourse>
>;

const preparedGetAllSupportTickets = db.query.supportTicket
  .findMany({
    with: {
      user: true,
      comments: {
        orderBy: (comment) => [asc(comment.createdAt)],
        with: { user: true },
      },
      assignedToUser: true,
      course: true,
      module: true,
      lesson: true,
    },
  })
  .prepare("getAllSupportTickets");

const preparedGetSupportTicketById = db.query.supportTicket
  .findFirst({
    where: (t) => eq(t.id, sql.placeholder("ticketId")),
    with: {
      user: true,
      comments: {
        orderBy: (comment) => [asc(comment.createdAt)],
        with: { user: true },
      },
      assignedToUser: true,
      course: true,
      module: true,
      lesson: true,
    },
  })
  .prepare("getSupportTicketById");

const preparedSupportTicketComment = db.query.supportTicketComment
  .findFirst({
    where: (comment) => eq(comment.id, sql.placeholder("commentId")),
    with: {
      user: true,
    },
  })
  .prepare("getSupportTicketCommentById");

export async function getAllSupportTickets() {
  const supportTickets = await preparedGetAllSupportTickets.execute();

  return supportTickets;
}

export async function getSupportTicketById({ ticketId }: { ticketId: string }) {
  const supportTicket = await preparedGetSupportTicketById.execute({
    ticketId,
  });

  return supportTicket;
}

export async function getSupportTicketCommentById({
  commentId,
}: {
  commentId: string;
}) {
  const supportTicketComment = await preparedSupportTicketComment.execute({
    commentId,
  });

  return supportTicketComment;
}

export async function getSupportTicketCountsByCourse() {
  const counts = await db
    .select({
      courseId: supportTicket.courseId,
      count: count(),
    })
    .from(supportTicket)
    .groupBy(supportTicket.courseId);

  // Convert to a map for easier lookup, filtering out null courseIds
  const countsMap = new Map(
    counts
      .filter((c) => c.courseId !== null)
      .map((c) => [c.courseId as string, Number(c.count)]),
  );

  return countsMap;
}
