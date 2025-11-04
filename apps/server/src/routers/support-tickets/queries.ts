import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";

export type AllSupportTickets = Awaited<
  ReturnType<typeof getAllSupportTickets>
>;
export type SupportTicketById = Awaited<
  ReturnType<typeof getSupportTicketById>
>;
export type SupportTicketCommentById = Awaited<
  ReturnType<typeof getSupportTicketCommentById>
>;

const preparedGetAllSupportTickets = db.query.supportTicket
  .findMany({
    with: {
      user: true,
      comments: true,
      assignedToUser: true,
      course: true,
      module: true,
      lesson: true,
    },
  })
  .prepare("getAllSupportTickets");

const preparedGetSupportTicketById = db.query.supportTicket
  .findFirst({
    where: (supportTicket) => eq(supportTicket.id, sql.placeholder("ticketId")),
    with: {
      user: true,
      comments: {
        orderBy: (comment) => [sql`${comment.createdAt} DESC`],
        with: {
          user: true,
        },
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
