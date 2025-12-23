import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ulid } from "ulid";
import { trpc } from "~/lib/trpc.client";

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

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  publishedAt: Date | string | null;
}

function AnnouncementsPage() {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: announcementsData,
    isLoading,
    refetch,
  } = useQuery(trpc.announcements.getAll.queryOptions());
  const createMutation = useMutation(
    trpc.announcements.create.mutationOptions(),
  );
  const updateMutation = useMutation(
    trpc.announcements.update.mutationOptions(),
  );
  const deleteMutation = useMutation(
    trpc.announcements.delete.mutationOptions(),
  );

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
            id: ulid(),
            title: value.title,
            message: value.message,
            type: value.type,
            publishedAt: value.publishedAt || null,
          });
          toast.success("Announcement created successfully");
        }
        refetch();
        handleCancel();
      } catch {
        toast.error(
          selectedAnnouncement
            ? "Failed to update announcement"
            : "Failed to create announcement",
        );
      }
    },
  });

  function handleEdit(announcement: Announcement) {
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
    } catch {
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
    <>
      <div className="mb-6 flex items-center justify-between pb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Announcements
        </h1>
        <button
          className="cursor-pointer rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
          onClick={handleCreate}
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
                {announcements.map((announcement: Announcement) => (
                  <button
                    className={`w-full cursor-pointer rounded-md border p-3 text-left transition-colors ${
                      selectedAnnouncement?.id === announcement.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    }`}
                    type="button"
                    key={announcement.id}
                    onClick={() => handleEdit(announcement)}
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
                              announcementTypeColors[announcement.type]
                            }`}
                          >
                            {announcementTypeLabels[announcement.type]}
                          </span>
                          {announcement.publishedAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Published
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
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
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <div>
                  <form.Field name="title">
                    {(field) => (
                      <>
                        <label
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          htmlFor="title"
                        >
                          Title
                        </label>
                        <input
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          id="title"
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
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
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          htmlFor="message"
                        >
                          Message
                        </label>
                        <textarea
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          id="message"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          rows={6}
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
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          htmlFor="type"
                        >
                          Type
                        </label>
                        <select
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          id="type"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value as AnnouncementType,
                            )
                          }
                        >
                          {Object.entries(announcementTypeLabels).map(
                            ([value, label]) => (
                              <option
                                key={value}
                                value={value}
                              >
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
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          htmlFor="publishedAt"
                        >
                          Publish Date (Optional)
                        </label>
                        <input
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          id="publishedAt"
                          type="datetime-local"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
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
                    className="cursor-pointer rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {selectedAnnouncement ? "Update" : "Create"}
                  </button>
                  <button
                    className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    type="button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  {selectedAnnouncement && (
                    <button
                      className="ml-auto cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      onClick={() => handleDelete(selectedAnnouncement.id)}
                      disabled={deleteMutation.isPending}
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
    </>
  );
}
