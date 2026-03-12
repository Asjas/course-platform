import { createFileRoute } from "@tanstack/react-router";
import { intlFormat } from "date-fns";
import { MailIcon } from "lucide-react";
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

  async function handleSendInvite(id: string, email: string) {
    const toastId = toast.loading(`Sending invite to ${email}...`);

    try {
      await EarlySignupsCollection.update(id, (draft) => {
        draft.confirmedAt = new Date();
      });

      toast.success(`Invite sent to ${email}.`, { id: toastId });
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invite. Please try again.", { id: toastId });
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
              <Table aria-label="Early signups with email, name, source, referrer, confirmed at, created at, and actions">
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Source</TableHeaderCell>
                    <TableHeaderCell>Referrer</TableHeaderCell>
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
                        {signup.confirmedAt ? (
                          <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400">
                            Invited
                          </span>
                        ) : (
                          <button
                            className="inline-flex cursor-pointer items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            type="button"
                            onClick={() =>
                              handleSendInvite(signup.id, signup.email)
                            }
                          >
                            <MailIcon
                              className="-ml-0.5 h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            Send Invite
                          </button>
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
