import { useLiveQuery } from "@tanstack/react-db";
import { EarlySignupsCollection } from "~/collections/early-signups";

export function useEarlySignups() {
  return useLiveQuery(EarlySignupsCollection);
}
