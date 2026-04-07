import type { PublishReadinessIssue } from "@apps/server/src/routers/courses/index";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  GlobeIcon,
  LockIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

interface CoursePublishSectionProps {
  courseId: string;
  courseName: string;
  isPublished: boolean;
}

/** Human-readable label for each transcript ineligibility reason. */
function readinessReasonLabel(reason: PublishReadinessIssue["reason"]): string {
  switch (reason) {
    case "missing":
      return "No transcript uploaded";
    case "invalid_schema":
      return "Transcript data is malformed";
    case "no_cues":
      return "Transcript has no caption cues";
  }
}

export function CoursePublishSection({
  courseId,
  courseName,
  isPublished,
}: CoursePublishSectionProps) {
  const [issues, setIssues] = useState<PublishReadinessIssue[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const updateCourseMutation = useMutation(
    trpc.courses.updateCourse.mutationOptions(),
  );

  async function handlePublish() {
    setIssues(null);
    setIsChecking(true);

    let readiness;
    try {
      readiness = await trpcClient.courses.checkPublishReadiness.query({
        courseId,
      });
    } catch {
      toast.error("Failed to check publish readiness. Please try again.");
      setIsChecking(false);
      return;
    } finally {
      setIsChecking(false);
    }

    if (!readiness.ready) {
      setIssues(readiness.issues);
      return;
    }

    setIssues([]);
    const toastId = toast.loading(`Publishing "${courseName}"...`);
    try {
      await updateCourseMutation.mutateAsync({ id: courseId, published: true });
      toast.success(`"${courseName}" is now published.`, { id: toastId });
      await queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
    } catch {
      toast.error("Failed to publish course. Please try again.", {
        id: toastId,
      });
    }
  }

  async function handleUnpublish() {
    const toastId = toast.loading(`Unpublishing "${courseName}"...`);
    try {
      await updateCourseMutation.mutateAsync({
        id: courseId,
        published: false,
      });
      toast.success(`"${courseName}" is now a draft.`, { id: toastId });
      setIssues(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
    } catch {
      toast.error("Failed to unpublish course. Please try again.", {
        id: toastId,
      });
    }
  }

  const isPending = isChecking || updateCourseMutation.status === "pending";

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
      aria-labelledby="course-publish-heading"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isPublished ? (
            <GlobeIcon
              className="h-4 w-4 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
          ) : (
            <LockIcon
              className="h-4 w-4 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          )}
          <h2
            className="text-sm font-medium text-gray-900 dark:text-white"
            id="course-publish-heading"
          >
            {isPublished ? "Published" : "Draft"}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isPublished
              ? "Visible to enrolled learners"
              : "Not visible to learners"}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isPublished ? (
            <button
              className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-disabled={isPending}
              disabled={isPending}
              onClick={handleUnpublish}
              type="button"
            >
              Unpublish
            </button>
          ) : (
            <button
              className="inline-flex cursor-pointer items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              aria-busy={isChecking}
              aria-disabled={isPending}
              disabled={isPending}
              onClick={handlePublish}
              type="button"
            >
              {isChecking ? "Checking…" : "Publish Course"}
            </button>
          )}
        </div>
      </div>

      {/* Transcript readiness issues */}
      {issues && issues.length > 0 && (
        <div
          className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950"
          aria-live="polite"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <AlertCircleIcon
              className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
            <div className="flex-1 text-sm text-red-800 dark:text-red-200">
              <p className="font-medium">
                Cannot publish — the following lessons are missing valid
                transcripts:
              </p>
              <ul className="mt-2 space-y-1">
                {issues.map((issue) => (
                  <li
                    className="flex items-center gap-1.5"
                    key={issue.lessonId}
                  >
                    <span
                      className="text-red-600 dark:text-red-400"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                    <Link
                      className="underline hover:no-underline"
                      aria-label={`Edit lesson: ${issue.lessonTitle}`}
                      params={{ courseId }}
                      to="/admin/courses/$courseId/edit"
                    >
                      {issue.lessonTitle}
                    </Link>
                    <span className="text-red-600 dark:text-red-400">
                      — {readinessReasonLabel(issue.reason)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* All clear confirmation */}
      {issues !== null && issues.length === 0 && !isPublished && (
        <div
          className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
          aria-live="polite"
          role="status"
        >
          <CheckCircleIcon
            className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
            aria-hidden="true"
          />
          All transcripts are ready. Publishing now…
        </div>
      )}
    </section>
  );
}
