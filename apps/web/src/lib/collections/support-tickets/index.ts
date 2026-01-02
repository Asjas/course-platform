/**
 * Support Tickets Collection
 *
 * Re-exports collection and hooks for support tickets.
 */

export {
  SupportTicketsCollection,
  type SupportTicket,
} from "./support-tickets.collection";

export {
  useSupportTickets,
  useSupportTicketsByCourseId,
  useSupportTicketById,
} from "./hooks";
