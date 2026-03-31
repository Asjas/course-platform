import type { AllEnrollmentsAsAdmin } from "@apps/server/src/routers/enrollments/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type EnrollmentAdmin = AllEnrollmentsAsAdmin[number];

export const EnrollmentsAdminCollection = createCollection(
  queryCollectionOptions<EnrollmentAdmin>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.enrollments.getAll.queryKey(),
    queryFn: () => trpcClient.enrollments.getAll.query(),
  }),
);
