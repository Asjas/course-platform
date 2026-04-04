import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Clock,
  Maximize2,
  Minimize2,
  Plus,
} from "lucide-react";
import { useState } from "react";
import {
  Tabs as AriaTabs,
  Tab,
  TabList,
  TabPanel,
} from "react-aria-components";
import {
  type CourseWithModulesAndLessons,
  CoursesCollection,
} from "~/collections/courses";
import { SupportTicketsCollection } from "~/collections/support-tickets";
import NewSupportTicketForm from "~/components/forms/create-support-ticket-form";
import Loading from "~/components/loading";
import SupportComment from "~/components/support-comment";
import { TranscriptPanel } from "~/components/transcript-panel";
import { VideoPlayer } from "~/components/video-player";
import { useCourseById } from "~/hooks/use-courses";
import {
  useSupportTicketById,
  useSupportTickets,
} from "~/hooks/use-support-tickets";
import { trpcClient } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

export const Route = createFileRoute(
  "/_authenticated/courses/$courseId/lessons/$lessonId",
)({
  component: LessonPage,
  loader: async ({ params }) => {
    await Promise.all([
      CoursesCollection.preload(),
      SupportTicketsCollection.preload(),
    ]);
    // Ensure we have the full course with modules and lessons
    const courseInCollection = CoursesCollection.get(params.courseId);
    // Check if we have modules with nested lessons (from getCourseById)
    const hasFullDetails =
      courseInCollection?.modules &&
      courseInCollection.modules.length > 0 &&
      "lessons" in courseInCollection.modules[0];
    if (!hasFullDetails) {
      const fullCourse = await trpcClient.courses.getById.query({
        courseId: params.courseId,
      });
      if (fullCourse) {
        CoursesCollection.utils.writeUpsert(fullCourse);
      }
    }
  },
});

// Manual interfaces for module/lesson data from getCourseById.
// `transcription` is jsonb (unknown) so it can be passed to TranscriptPanel
// without a type assertion, while remaining properly typed for Zod validation.
interface LessonInModule {
  id: string;
  title: string;
  order: number;
  duration: number | null;
  videoUrl: string;
  videoProvider: string;
  transcription: unknown;
}

interface ModuleWithLessons {
  id: string;
  title: string;
  order: number;
  description: string;
  lessons?: LessonInModule[];
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function LessonPage() {
  const { courseId, lessonId } = Route.useParams();
  const [layoutMode, setLayoutMode] = useState<"sidebar" | "fullscreen">(
    "sidebar",
  );
  const [selectedTab, setSelectedTab] = useState("transcription");
  const [viewMode, setViewMode] = useState<"list" | "create" | "view">("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: course, isLoading } = useCourseById({ courseId });
  const { data: allTickets, isLoading: ticketsLoading } = useSupportTickets();
  const { data: selectedTicket } = useSupportTicketById({
    ticketId: selectedTicketId || "",
  });

  // Filter tickets for this lesson
  const lessonTickets = allTickets?.filter(
    (ticket) => ticket.lessonId === lessonId,
  );

  if (isLoading || !course) {
    return (
      <div className="p-8">
        <p>Loading lesson...</p>
      </div>
    );
  }

  // Cast to CourseWithModulesAndLessons since the loader ensures we have full course data
  const fullCourse = course as CourseWithModulesAndLessons;
  // Cast modules to the canonical typed shape (Drizzle prepared-statement
  // inference loses nested relation types, so we assert the shape explicitly).
  const typedModules = (fullCourse.modules ?? []) as ModuleWithLessons[];

  // Find the lesson in the course modules
  let lesson: LessonInModule | null = null;
  for (const module of typedModules) {
    const found = module.lessons?.find((l) => l.id === lessonId);
    if (found) {
      lesson = found;
      break;
    }
  }

  if (!lesson) {
    return (
      <div className="p-8">
        <p>Lesson not found</p>
      </div>
    );
  }

  // Spread to avoid mutating the original query-result array in-place.
  const sortedModules: ModuleWithLessons[] = [...typedModules].sort(
    (a, b) => a.order - b.order,
  );

  const toggleLayout = () => {
    setLayoutMode((prev) => (prev === "sidebar" ? "fullscreen" : "sidebar"));
  };

  // Get video URL - support both YouTube IDs and full URLs
  const getVideoUrl = (urlOrId: string, provider: string): string => {
    if (provider === "youtube") {
      // If it's already a full URL, return it
      if (urlOrId.startsWith("http")) {
        return urlOrId;
      }
      // Otherwise, construct YouTube URL from ID
      return `https://www.youtube.com/watch?v=${urlOrId}`;
    }
    // For other providers (Vimeo, etc.), return as-is
    return urlOrId;
  };

  const videoUrl =
    lesson.videoProvider && lesson.videoUrl
      ? getVideoUrl(lesson.videoUrl, lesson.videoProvider)
      : null;

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            to="/courses/$courseId"
            params={{ courseId }}
          >
            <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
            Back to Course
          </Link>

          <button
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            onClick={toggleLayout}
            aria-label={
              layoutMode === "sidebar"
                ? "Switch to fullscreen mode"
                : "Switch to sidebar mode"
            }
          >
            {layoutMode === "sidebar" ? (
              <>
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            ) : (
              <>
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grow overflow-hidden">
        {layoutMode === "sidebar" ? (
          <div className="sidebar grid h-full lg:grid-cols-[1fr_400px]">
            {/* Video Player */}
            <div className="flex flex-col bg-black">
              {videoUrl ? (
                <VideoPlayer url={videoUrl} />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-gray-900 text-white">
                  <p>No video available</p>
                </div>
              )}
            </div>

            {/* Lesson Playlist */}
            <div className="flex flex-col overflow-hidden border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="shrink-0 border-b border-gray-200 p-4 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Course Content
                </h2>
              </div>

              <div className="grow overflow-y-auto">
                {sortedModules.map((module) => (
                  <div
                    className="border-b border-gray-200 dark:border-gray-700"
                    key={module.id}
                  >
                    <div className="shrink-0 bg-gray-50 p-3 dark:bg-gray-900">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {module.title}
                      </h3>
                    </div>

                    {module.lessons && module.lessons.length > 0 && (
                      <ul>
                        {module.lessons
                          .sort((a, b) => a.order - b.order)
                          .map((moduleLesson) => {
                            const isActive = moduleLesson.id === lessonId;
                            return (
                              <li key={moduleLesson.id}>
                                <Link
                                  className={`flex items-center gap-3 border-l-4 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
                                    isActive
                                      ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                                      : "border-transparent"
                                  }`}
                                  to="/courses/$courseId/lessons/$lessonId"
                                  params={{
                                    courseId,
                                    lessonId: moduleLesson.id,
                                  }}
                                >
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600">
                                    <Check className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                                  </div>
                                  <span
                                    className={`grow text-sm ${
                                      isActive
                                        ? "font-semibold text-gray-900 dark:text-white"
                                        : "text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {moduleLesson.title}
                                  </span>
                                  {moduleLesson.duration && (
                                    <span className="flex shrink-0 items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                      <Clock className="h-3 w-3" />
                                      {formatDuration(moduleLesson.duration)}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col overflow-hidden">
            {/* Fullscreen Video Player — capped at 45 vh so the tabs section
                below always has room. Without the cap, aspect-video expands
                to ~720 px on a 1280 px-wide viewport, leaving zero height for
                the content grid. */}
            <div className="max-h-[45vh] w-full shrink-0 overflow-hidden bg-black">
              {videoUrl ? (
                <VideoPlayer url={videoUrl} />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-gray-900 text-white">
                  <p>No video available</p>
                </div>
              )}
            </div>

            {/* Notes and Playlist Side by Side */}
            <div className="grid grow gap-6 overflow-hidden bg-white p-6 md:grid-cols-2 dark:bg-gray-800">
              {/* Tabs Section (replaces Notes) */}
              <div className="flex flex-col overflow-hidden">
                <AriaTabs
                  className="flex h-full flex-col"
                  selectedKey={selectedTab}
                  onSelectionChange={(key) => setSelectedTab(key as string)}
                >
                  <TabList
                    className="flex border-b border-gray-200 dark:border-gray-700"
                    aria-label="Lesson content"
                  >
                    <Tab
                      className={({ isSelected }) =>
                        cn(
                          "cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition-colors outline-none",
                          isSelected
                            ? "border-green-600 text-green-600"
                            : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
                        )
                      }
                      id="transcription"
                    >
                      Transcription
                    </Tab>
                    <Tab
                      className={({ isSelected }) =>
                        cn(
                          "cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition-colors outline-none",
                          isSelected
                            ? "border-green-600 text-green-600"
                            : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
                        )
                      }
                      id="notes"
                    >
                      Notes
                    </Tab>
                    <Tab
                      className={({ isSelected }) =>
                        cn(
                          "cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition-colors outline-none",
                          isSelected
                            ? "border-green-600 text-green-600"
                            : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
                        )
                      }
                      id="support"
                    >
                      Support ({lessonTickets?.length || 0})
                    </Tab>
                  </TabList>

                  <TabPanel
                    className="grow overflow-hidden p-0"
                    id="transcription"
                  >
                    <TranscriptPanel
                      transcription={lesson.transcription}
                      hasVideo={Boolean(videoUrl)}
                    />
                  </TabPanel>

                  <TabPanel
                    className="grow overflow-y-auto p-4"
                    id="notes"
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300">
                        Notes coming soon...
                      </p>
                    </div>
                  </TabPanel>

                  <TabPanel
                    className="flex grow flex-col overflow-hidden p-4"
                    id="support"
                  >
                    {viewMode === "list" && (
                      <div className="flex grow flex-col overflow-hidden">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Support Tickets
                          </h3>
                          <button
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                            onClick={() => setViewMode("create")}
                          >
                            <Plus className="h-4 w-4" />
                            New Ticket
                          </button>
                        </div>

                        {ticketsLoading ? (
                          <Loading />
                        ) : lessonTickets && lessonTickets.length > 0 ? (
                          <div className="grow space-y-2 overflow-y-auto">
                            {lessonTickets.map((ticket) => (
                              <button
                                className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                                key={ticket.id}
                                onClick={() => {
                                  setSelectedTicketId(ticket.id);
                                  setViewMode("view");
                                }}
                              >
                                <div className="mb-2 flex items-start justify-between">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {ticket.title}
                                  </h4>
                                  <span
                                    className={cn(
                                      "rounded-full px-2 py-1 text-xs font-medium",
                                      ticket.status === "open"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
                                    )}
                                  >
                                    {ticket.status}
                                  </span>
                                </div>
                                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                  {ticket.description}
                                </p>
                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                  <span className="capitalize">
                                    {ticket.priority} priority
                                  </span>
                                  <span>
                                    {ticket.comments?.length || 0} comments
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex grow items-center justify-center text-gray-600 dark:text-gray-400">
                            <p>No support tickets for this lesson yet.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {viewMode === "create" && (
                      <div className="grow overflow-y-auto">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Create New Ticket
                          </h3>
                          <button
                            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => setViewMode("list")}
                          >
                            ← Back to list
                          </button>
                        </div>
                        <NewSupportTicketForm />
                      </div>
                    )}

                    {viewMode === "view" && selectedTicket && (
                      <div className="grow overflow-y-auto">
                        <div className="mb-4 flex items-center justify-between">
                          <button
                            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => {
                              setViewMode("list");
                              setSelectedTicketId(null);
                            }}
                          >
                            ← Back to list
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="mb-2 flex items-start justify-between">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {selectedTicket.title}
                              </h3>
                              <span
                                className={cn(
                                  "rounded-full px-3 py-1 text-sm font-medium",
                                  selectedTicket.status === "open"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
                                )}
                              >
                                {selectedTicket.status}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {selectedTicket.description}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                              <span className="capitalize">
                                {selectedTicket.priority} priority
                              </span>
                            </div>
                          </div>

                          {selectedTicket.comments &&
                            selectedTicket.comments.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  Comments
                                </h4>
                                {selectedTicket.comments.map((comment) => (
                                  <SupportComment
                                    key={comment.id}
                                    ticket={selectedTicket}
                                    content={comment.comment}
                                    date={comment.createdAt}
                                  />
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </TabPanel>
                </AriaTabs>
              </div>

              {/* Playlist Section */}
              <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="shrink-0 border-b border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Course Content
                  </h3>
                </div>

                <div className="grow overflow-y-auto">
                  {sortedModules.map((module) => (
                    <div
                      className="border-b border-gray-200 dark:border-gray-700"
                      key={module.id}
                    >
                      <div className="shrink-0 bg-gray-50 p-3 dark:bg-gray-900">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {module.title}
                        </h4>
                      </div>

                      {module.lessons && module.lessons.length > 0 && (
                        <ul>
                          {module.lessons
                            .sort((a, b) => a.order - b.order)
                            .map((moduleLesson) => {
                              const isActive = moduleLesson.id === lessonId;
                              return (
                                <li key={moduleLesson.id}>
                                  <Link
                                    className={`flex items-center gap-3 border-l-4 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
                                      isActive
                                        ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                                        : "border-transparent"
                                    }`}
                                    to="/courses/$courseId/lessons/$lessonId"
                                    params={{
                                      courseId,
                                      lessonId: moduleLesson.id,
                                    }}
                                  >
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600">
                                      <Check className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <span
                                      className={`grow text-sm ${
                                        isActive
                                          ? "font-semibold text-gray-900 dark:text-white"
                                          : "text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {moduleLesson.title}
                                    </span>
                                    {moduleLesson.duration && (
                                      <span className="flex shrink-0 items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(moduleLesson.duration)}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              );
                            })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
