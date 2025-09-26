import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:queries:support" });

// All support tickets are always publicly viewable
export async function getAllSupportTickets() {
  const preparedStatement = db.query.supportTicket
    .findMany({
      with: {
        user: true,
        comments: true,
        attachments: true,
        assignedToUser: true,
        course: true,
        module: true,
        lesson: true,
      },
    })
    .prepare("getAllSupportTickets");

  try {
    const tickets = await preparedStatement.execute();

    return { tickets, count: tickets.length };
  } catch (err) {
    log.error(err, "Failed to get all support tickets");
    throw err;
  }
}

// Individual support tickets are always publicly viewable
export async function getSupportTicketById(id: string) {
  const preparedStatement = db.query.supportTicket
    .findFirst({
      where: (supportTicket) => eq(supportTicket.id, sql.placeholder("id")),
      with: {
        user: true,
        comments: {
          orderBy: (comment) => [sql`${comment.createdAt} DESC`],
          with: {
            user: true,
          },
        },
        attachments: true,
        assignedToUser: true,
        course: true,
        module: true,
        lesson: true,
      },
    })
    .prepare("getSupportTicketById");

  try {
    const ticket = await preparedStatement.execute({ id });

    return ticket ?? null;
  } catch (err) {
    log.error(err, `Failed to get support ticket with id ${id}`);
    throw err;
  }
}
