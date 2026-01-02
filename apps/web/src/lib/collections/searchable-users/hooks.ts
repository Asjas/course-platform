/**
 * Searchable Users Hooks
 *
 * React hooks for accessing the searchable users collection.
 */
import { SearchableUsersCollection } from "./searchable-users.collection";
import { useLiveQuery } from "@tanstack/react-db";

/**
 * Get all searchable users.
 * Uses the offline-first collection.
 */
export function useSearchableUsers() {
  return useLiveQuery(SearchableUsersCollection);
}
