import { eq, useLiveQuery } from "@tanstack/react-db";
import { SupportTicketsCollection } from "~/collections/support-tickets";

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
