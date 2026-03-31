import { useLiveQuery } from "@tanstack/react-db";
import { EnrollmentsAdminCollection } from "~/collections/enrollments";

export function useEnrollmentsAdmin() {
  return useLiveQuery(EnrollmentsAdminCollection);
}
