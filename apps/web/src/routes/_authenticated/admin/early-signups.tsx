import { createFileRoute } from "@tanstack/react-router";
import { intlFormat } from "date-fns";
import { MailIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "~/components/empty-state";
import Loading from "~/components/loading";
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
} from "~/components/ui/table";
import { EarlySignupsCollection, useEarlySignups } from "~/lib/db.collections";

export const Route = createFileRoute("/_authenticated/admin/early-signups")({
  loader: async () => {
    await EarlySignupsCollection.preload();
  },
  component: AdminEarlySignupsPage,
});

export function AdminEarlySignupsPage() {
  const { data: signups, isLoading } = useEarlySignups();
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());

  async function handleSendInvite(id: string, email: string) {
    if (sendingIds.has(id)) return;

    setSendingIds((prev) => new Set(prev).add(id));
    const toastId = toast.loading(`Sending invite to ${email}...`);

    try {
      await EarlySignupsCollection.update(id, (draft) => {
        draft.confirmedAt = new Date();
      });

      toast.success(`Invite sent to ${email}.`, { id: toastId });
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invite. Please try again.", { id: toastId });
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleCancelInvite(id: string, email: string) {
    if (cancellingIds.has(id)) return;

    setCancellingIds((prev) => new Set(prev).add(id));
    const toastId = toast.loading(`Canceling invite for ${email}...`);

    try {
      await EarlySignupsCollection.update(id, (draft) => {
        draft.unsubscribedAt = new Date();
      });

      toast.success(`Invite canceled for ${email}.`, { id: toastId });
    } catch (error) {
      console.error("Error canceling invite:", error);
      toast.error("Failed to cancel invite. Please try again.", {
        id: toastId,
      });
    } finally {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Early Signups
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage early access signups and send invite emails to waitlisted
            users.
          </p>
        </div>
      </div>

      {signups.length > 0 ? (
        <div className="mt-12 flow-root">
          <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table aria-label="Early signups with email, name, source, referrer, status, confirmed at, created at, and actions">
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Source</TableHeaderCell>
                    <TableHeaderCell>Referrer</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Confirmed At</TableHeaderCell>
                    <TableHeaderCell>Created At</TableHeaderCell>
                    <TableHeaderCell>
                      <span className="sr-only">Actions</span>
                    </TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>

                <TableBody>
                  {signups.map((signup) => (
                    <TableBodyRow key={signup.id}>
                      <TableBodyCell className="font-medium">
                        {signup.email}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {signup.name || (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {signup.source}
                      </TableBodyCell>

                      <TableBodyCell className="text-gray-600 dark:text-gray-300">
                        {signup.referrer || (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                        {signup.unsubscribedAt ? (
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-500/30 ring-inset dark:bg-gray-800 dark:text-gray-300">
                            Canceled
                          </span>
                        ) : signup.confirmedAt ? (
                          <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400">
                            Invited
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-500/40 ring-inset dark:bg-amber-900/30 dark:text-amber-400">
                            Pending
                          </span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                        {signup.confirmedAt ? (
                          intlFormat(new Date(signup.confirmedAt), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell className="text-sm text-gray-500 dark:text-gray-400">
                        {intlFormat(new Date(signup.createdAt), {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableBodyCell>

                      <TableBodyCell>
                        {signup.unsubscribedAt ? (
                          <span className="text-xs text-gray-500">—</span>
                        ) : signup.confirmedAt ? (
                          <span className="text-xs text-gray-500">—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              className="inline-flex cursor-pointer items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                              disabled={
                                sendingIds.has(signup.id) ||
                                cancellingIds.has(signup.id)
                              }
                              aria-disabled={
                                sendingIds.has(signup.id) ||
                                cancellingIds.has(signup.id)
                              }
                              onClick={() =>
                                handleSendInvite(signup.id, signup.email)
                              }
                            >
                              <MailIcon
                                className="-ml-0.5 h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              {sendingIds.has(signup.id)
                                ? "Sending…"
                                : "Send Invite"}
                            </button>
                            <button
                              className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                              type="button"
                              disabled={
                                cancellingIds.has(signup.id) ||
                                sendingIds.has(signup.id)
                              }
                              aria-disabled={
                                cancellingIds.has(signup.id) ||
                                sendingIds.has(signup.id)
                              }
                              onClick={() =>
                                handleCancelInvite(signup.id, signup.email)
                              }
                            >
                              {cancellingIds.has(signup.id)
                                ? "Canceling…"
                                : "Cancel"}
                            </button>
                          </div>
                        )}
                      </TableBodyCell>
                    </TableBodyRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No early signups"
          description="There are no early access signups yet."
        />
      )}
    </div>
  );
}
