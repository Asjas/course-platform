import { useLiveQuery } from "@tanstack/react-db";
import { SearchableUsersCollection } from "~/collections/searchable-users";

export function useSearchableUsers() {
  return useLiveQuery(SearchableUsersCollection);
}
