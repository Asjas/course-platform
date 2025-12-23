import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "~/lib/trpc.client.js";
import AdminLayout from "~/components/layouts/admin-layout";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { nanoid } from "nanoid";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: AnnouncementsPage,
});

type AnnouncementType =
  | "platform_update"
  | "platform_warning"
  | "course_update"
  | "new_course"
  | "general"
  | "warning";

const announcementTypeLabels: Record<AnnouncementType, string> = {
  platform_update: "Platform Update",
  platform_warning: "Platform Warning",
  course_update: "Course Update",
  new_course: "New Course",
  general: "General",
  warning: "Warning",
};

const announcementTypeColors: Record<AnnouncementType, string> = {
  platform_update: "bg-blue-100 text-blue-800",
  platform_warning: "bg-red-100 text-red-800",
  course_update: "bg-green-100 text-green-800",
  new_course: "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-800",
  warning: "bg-yellow-100 text-yellow-800",
};

function AnnouncementsPage() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: announcementsData,
    isLoading,
    refetch,
  } = trpc.announcements.getAll.useQuery();
  const createMutation = trpc.announcements.create.useMutation();
  const updateMutation = trpc.announcements.update.useMutation();
  const deleteMutation = trpc.announcements.delete.useMutation();

  const form = useForm({
    defaultValues: {
      title: "",
      message: "",
      type: "general" as AnnouncementType,
      publishedAt: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (selectedAnnouncement) {
          await updateMutation.mutateAsync({
            id: selectedAnnouncement.id,
            updates: {
              title: value.title,
              message: value.message,
              type: value.type,
              publishedAt: value.publishedAt || null,
            },
          });
          toast.success("Announcement updated successfully");
        } else {
          await createMutation.mutateAsync({
            id: nanoid(),
            title: value.title,
            message: value.message,
            type: value.type,
            publishedAt: value.publishedAt || null,
          });
          toast.success("Announcement created successfully");
        }
        refetch();
        handleCancel();
      } catch (error) {
        toast.error(
          selectedAnnouncement
            ? "Failed to update announcement"
            : "Failed to create announcement",
        );
      }
    },
  });

  function handleEdit(announcement: any) {
    setSelectedAnnouncement(announcement);
    setIsCreating(false);
    form.setFieldValue("title", announcement.title);
    form.setFieldValue("message", announcement.message);
    form.setFieldValue("type", announcement.type);
    form.setFieldValue(
      "publishedAt",
      announcement.publishedAt
        ? new Date(announcement.publishedAt).toISOString().slice(0, 16)
        : "",
    );
  }

  function handleCancel() {
    setSelectedAnnouncement(null);
    setIsCreating(false);
    form.reset();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Announcement deleted successfully");
      refetch();
      if (selectedAnnouncement?.id === id) {
        handleCancel();
      }
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  }

  function handleCreate() {
    setIsCreating(true);
    setSelectedAnnouncement(null);
    form.reset();
  }

  const announcements = announcementsData?.announcements || [];

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Announcements
        </h1>
        <button
          onClick={handleCreate}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Announcements List */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              All Announcements ({announcements.length})
            </h2>

            {isLoading ? (
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            ) : announcements.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No announcements yet
              </p>
            ) : (
              <div className="space-y-2">
                {announcements.map((announcement: any) => (
                  <div
                    key={announcement.id}
                    onClick={() => handleEdit(announcement)}
                    className={`cursor-pointer rounded-md border p-3 transition-colors ${
                      selectedAnnouncement?.id === announcement.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {announcement.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {announcement.message.substring(0, 60)}
                          {announcement.message.length > 60 ? "..." : ""}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              announcementTypeColors[
                                announcement.type as AnnouncementType
                              ]
                            }`}
                          >
                            {
                              announcementTypeLabels[
                                announcement.type as AnnouncementType
                              ]
                            }
                          </span>
                          {announcement.publishedAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Published
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-2">
          {isCreating || selectedAnnouncement ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                {selectedAnnouncement ? "Edit" : "Create"} Announcement
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="space-y-4"
              >
                <div>
                  <form.Field name="title">
                    {(field) => (
                      <>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Title
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </>
                    )}
                  </form.Field>
                </div>

                <div>
                  <form.Field name="message">
                    {(field) => (
                      <>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          rows={6}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </>
                    )}
                  </form.Field>
                </div>

                <div>
                  <form.Field name="type">
                    {(field) => (
                      <>
                        <label
                          htmlFor="type"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Type
                        </label>
                        <select
                          id="type"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.target.value as AnnouncementType)
                          }
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          {Object.entries(announcementTypeLabels).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      </>
                    )}
                  </form.Field>
                </div>

                <div>
                  <form.Field name="publishedAt">
                    {(field) => (
                      <>
                        <label
                          htmlFor="publishedAt"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Publish Date (Optional)
                        </label>
                        <input
                          id="publishedAt"
                          type="datetime-local"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Leave empty for draft
                        </p>
                      </>
                    )}
                  </form.Field>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {selectedAnnouncement ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  {selectedAnnouncement && (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedAnnouncement.id)}
                      disabled={deleteMutation.isPending}
                      className="ml-auto rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-gray-600 dark:text-gray-400">
                Select an announcement to edit or create a new one
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
