import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { ONE_WEEK } from "~/lib/constants.js";
import { redis } from "~/lib/redis.js";

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

  const tickets = await preparedStatement.execute();

  return { tickets, count: tickets.length };
}

// All support tickets are always publicly viewable
export async function getAllSupportTicketsCached() {
  const cacheKey = `supportTickets:all`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const tickets = await getAllSupportTickets();
  if (tickets.count > 0) {
    await redis.setex(cacheKey, JSON.stringify(tickets), ONE_WEEK);
  }

  return tickets;
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

  const ticket = await preparedStatement.execute({ id });

  return ticket ?? null;
}

// Individual support tickets are always publicly viewable
export async function getSupportTicketByIdCached(id: string) {
  const cacheKey = `supportTicket:id:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const ticket = await getSupportTicketById(id);
  if (ticket) {
    await redis.setex(cacheKey, JSON.stringify(ticket), ONE_WEEK);
  }

  return ticket;
}
