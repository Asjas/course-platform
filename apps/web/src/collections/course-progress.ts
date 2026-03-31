import type { AllCourseProgressAsAdmin } from "@apps/server/src/routers/courses/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type CourseProgressAdmin = AllCourseProgressAsAdmin[number];

export const CourseProgressAdminCollection = createCollection(
  queryCollectionOptions<CourseProgressAdmin>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.courses.getAllProgressAsAdmin.queryKey(),
    queryFn: () => trpcClient.courses.getAllProgressAsAdmin.query(),
  }),
);
