/**
 * Support Tickets Collection Hooks
 *
 * React hooks for accessing support ticket data offline-first.
 */
import { SupportTicketsCollection } from "./support-tickets.collection";
import { eq, useLiveQuery } from "@tanstack/react-db";

export function useSupportTickets() {
  return useLiveQuery(SupportTicketsCollection);
}

export function useSupportTicketsByCourseId({
  courseId,
}: {
  courseId: string;
}) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ supportTicket: SupportTicketsCollection })
        .where(({ supportTicket }) => eq(supportTicket.courseId, courseId))
        .select(({ supportTicket }) => supportTicket);
    },
    [courseId],
  );
}

export function useSupportTicketById({ ticketId }: { ticketId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ supportTicket: SupportTicketsCollection })
        .where(({ supportTicket }) => eq(supportTicket.id, ticketId))
        .findOne();
    },
    [ticketId],
  );
}
