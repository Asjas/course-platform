/**
 * Announcements Hooks
 *
 * React hooks for accessing the announcements collection.
 */
import { AnnouncementsCollection } from "./announcements.collection";
import { useLiveQuery } from "@tanstack/react-db";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "~/lib/trpc.client";

/**
 * Get all published announcements.
 * Uses the offline-first collection.
 */
export function useAnnouncements() {
  return useLiveQuery(AnnouncementsCollection);
}

/**
 * Get unread announcements for a user.
 * Uses React Query with polling as this is user-scoped.
 */
export function useUnreadAnnouncements({ userId }: { userId: string }) {
  return useQuery({
    ...trpc.announcements.getUnreadForUser.queryOptions(userId),
    refetchInterval: 30000, // Poll every 30 seconds for new announcements
    refetchIntervalInBackground: true,
  });
}

/**
 * Get read announcements for a user.
 * Uses React Query as this is user-scoped.
 */
export function useReadAnnouncements({ userId }: { userId: string }) {
  return useQuery(trpc.announcements.getReadForUser.queryOptions(userId));
}
