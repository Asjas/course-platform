import type { SearchableUsers } from "@apps/server/src/routers/directMessages/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type SearchableUser = SearchableUsers[number];

export const SearchableUsersCollection = createCollection(
  queryCollectionOptions<SearchableUser>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.directMessages.getSearchable.queryKey(),
    queryFn: () => trpcClient.directMessages.getSearchable.query(),
  }),
);
